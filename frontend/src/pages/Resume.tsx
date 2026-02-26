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
        contentType: file.type || "application/octet-stream",
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

      <div className="resume-upload" role="region" aria-label="Resume upload and analysis">
        <p className="resume-upload__hint">Step 1: Choose a file. Step 2: Click &quot;Upload &amp; Analyze&quot;.</p>
        <input
          id="resume-file-input"
          type="file"
          accept={ACCEPT}
          className="resume-upload__input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            setFile(f || null)
            setError(null)
          }}
          disabled={uploading}
          data-testid="resume-file-input"
        />
        <label htmlFor="resume-file-input" className="resume-upload__btn resume-upload__btn--choose">
          {file ? "Change file" : "Choose resume file (PDF, DOC, DOCX, or image)"}
        </label>
        {file && (
          <p className="resume-upload__name" data-testid="resume-file-name">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
        <button
          type="button"
          className="btn-verify resume-upload__btn resume-upload__btn--analyze"
          onClick={handleUpload}
          disabled={!file || uploading}
          data-testid="resume-upload-analyze"
          aria-label="Upload and analyze resume"
          title={!file ? "Select a file first" : "Upload and run analysis"}
        >
          {uploading ? "Uploading…" : "Upload & Analyze"}
        </button>
        {!file && (
          <span className="resume-upload__muted">Select a file above to enable this button.</span>
        )}
      </div>

      {error && (
        <div className="status error">
          <p><strong>Error</strong>: {error}</p>
          <p className="detail">
            {error.toLowerCase().includes("bucket") || error.toLowerCase().includes("not found")
              ? "The Supabase Storage bucket \"documents\" is missing. In your Supabase project: open Dashboard → SQL Editor → New query, paste and run the contents of supabase/resume-storage.sql. That creates the bucket and policies so uploads work."
              : "Ensure the Supabase bucket \"documents\" allows your file type (e.g. application/pdf). Run supabase/resume-storage.sql in Supabase Dashboard → SQL Editor to create/update the bucket."}
          </p>
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
          <h2>Stored in Supabase</h2>
          <p>Your file is saved in <strong>Supabase Storage</strong> (bucket: <code>documents</code>) and a row was added to the <strong>resume_uploads</strong> table.</p>
          <p><strong>File</strong>: {lastUpload.file_name}</p>
          <p><strong>Storage path</strong>: <code>{lastUpload.storage_path}</code></p>
          <p><strong>Uploaded at</strong>: {new Date(lastUpload.uploaded_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}
