package com.skilljobgap.employability.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.skilljobgap.employability.R

class SkillsAdapter(
    private var items: List<SkillWithStatus>,
    private val onRating: (skillId: String, value: Int) -> Unit
) : RecyclerView.Adapter<SkillsAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_skill_row, parent, false)
        return ViewHolder(v, onRating)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    fun updateItems(newItems: List<SkillWithStatus>) {
        items = newItems
        notifyDataSetChanged()
    }

    class ViewHolder(
        itemView: View,
        private val onRating: (skillId: String, value: Int) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {

        private val skillName: TextView = itemView.findViewById(R.id.skillName)
        private val skillStatus: TextView = itemView.findViewById(R.id.skillStatus)
        private val skillMeta: TextView = itemView.findViewById(R.id.skillMeta)
        private val skillRatingButtons: LinearLayout = itemView.findViewById(R.id.skillRatingButtons)
        private val skillProficiencyLabel: TextView = itemView.findViewById(R.id.skillProficiencyLabel)

        fun bind(item: SkillWithStatus) {
            skillName.text = item.skill.name
            skillStatus.text = item.status.uppercase()
            skillMeta.text = "Difficulty ${item.skill.difficulty} · Weight ${item.skill.weight}"
            skillProficiencyLabel.text = "/ ${item.target}"

            skillRatingButtons.removeAllViews()
            for (n in 1..5) {
                val btn = Button(itemView.context, null, com.google.android.material.R.attr.materialButtonOutlinedStyle)
                btn.text = n.toString()
                btn.setPadding(24, 12, 24, 12)
                val isActive = n <= item.proficiency
                btn.setBackgroundResource(
                    if (isActive) android.R.drawable.btn_default
                    else com.google.android.material.R.drawable.mtrl_btn_outline_stroke
                )
                btn.setOnClickListener { onRating(item.skill.id, n) }
                val lp = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT
                )
                lp.marginEnd = 4
                skillRatingButtons.addView(btn, lp)
            }
        }
    }
}
