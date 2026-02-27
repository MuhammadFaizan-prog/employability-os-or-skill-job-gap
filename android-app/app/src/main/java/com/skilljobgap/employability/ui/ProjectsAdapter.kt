package com.skilljobgap.employability.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.CheckBox
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.skilljobgap.employability.R
import com.skilljobgap.employability.data.ProjectRow

data class ProjectWithStatus(
    val project: ProjectRow,
    val completed: Boolean,
    val status: String
)

class ProjectsAdapter(
    private var items: List<ProjectWithStatus>,
    private val onToggle: (projectId: String, completed: Boolean) -> Unit
) : RecyclerView.Adapter<ProjectsAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_project, parent, false)
        return ViewHolder(v, onToggle)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    fun updateItems(newItems: List<ProjectWithStatus>) {
        items = newItems
        notifyDataSetChanged()
    }

    class ViewHolder(
        itemView: View,
        private val onToggle: (projectId: String, completed: Boolean) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {

        private val title: TextView = itemView.findViewById(R.id.projectTitle)
        private val status: TextView = itemView.findViewById(R.id.projectStatus)
        private val difficulty: TextView = itemView.findViewById(R.id.projectDifficulty)
        private val complete: CheckBox = itemView.findViewById(R.id.projectComplete)

        fun bind(item: ProjectWithStatus) {
            title.text = item.project.title
            status.text = item.status
            difficulty.text = "Difficulty: ${when (item.project.difficulty) { 1 -> "Easy"; 2 -> "Medium"; else -> "Hard" }}"
            complete.isChecked = item.completed
            complete.setOnCheckedChangeListener { _, isChecked ->
                onToggle(item.project.id, isChecked)
            }
        }
    }
}
