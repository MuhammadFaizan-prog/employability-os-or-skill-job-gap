import { useState } from "react"
import { supabase } from "../lib/supabase"
import { analyzeResume, type ResumeAnalysisResult } from "../lib/resumeAnalyzer"

const BUCKET = "documents"
const ACCEPT = ".pdf,.doc,.docx,image/jpeg,image/png,image/webp,image/gif"

export function Resume() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpload, setLastUpload] = useState<{ file_name: string; storage_path: string; uploaded_at: string } | null>(null)

  async function handleUpload() {
    if (!file || !supabase) {
      setError(supabase ? "Select a file first." : "Supabase not configured.")
      return
    }
    setUploading(true)
    setError(null)
    setResult(null)
    try {
      const path = `resumes/${crypto.randomUUID()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })
      if (uploadErr) throw new Error(uploadErr.message)

      const analysis = analyzeResume(file)
      const { data: row, error: insertErr } = await supabase
        .from("resume_uploads")
        .insert({
          file_name: file.name,
          storage_path: path,
          file_type: file.type,
          file_size: file.size,
          analysis_score: analysis.score,
        })
        .select("id, file_name, storage_path, uploaded_at")
        .single()

      if (insertErr) throw new Error(insertErr.message)
      setLastUpload({
        file_name: row.file_name,
        storage_path: row.storage_path,
        uploaded_at: row.uploaded_at,
      })
      setResult(analysis)
      setFile(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <h1>Resume Analyzer</h1>
      <p>Upload your resume (PDF, DOC, DOCX, or image). It is stored in Supabase Storage and analyzed (stub: score + suggestions).</p>

      <div className="resume-upload">
        <label className="resume-upload__label">
          <span>Choose file</span>
          <input
            type="file"
            accept={ACCEPT}
            onChange={(e) => {
              const f = e.target.files?.[0]
              setFile(f || null)
              setError(null)
            }}
            disabled={uploading}
          />
        </label>
        {file && <p className="resume-upload__name">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
        <button
          type="button"
          className="btn-verify"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading…" : "Upload & Analyze"}
        </button>
      </div>

      {error && (
        <div className="status error">
          <p><strong>Error</strong>: {error}</p>
        </div>
      )}

      {result && (
        <div className="status success resume-result">
          <h2>Analysis result</h2>
          <p><strong>Score</strong>: {result.score}/100</p>
          <ul>
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {lastUpload && (
        <div className="resume-last">
          <h2>Last upload (stored in DB + Storage)</h2>
          <p><strong>File</strong>: {lastUpload.file_name}</p>
          <p><strong>Path</strong>: {lastUpload.storage_path}</p>
          <p><strong>At</strong>: {new Date(lastUpload.uploaded_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
