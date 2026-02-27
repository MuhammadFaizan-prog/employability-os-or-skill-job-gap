package com.skilljobgap.employability.ui

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.SeekBar
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.skilljobgap.employability.data.SkillRow
import com.skilljobgap.employability.databinding.ItemOnboardingSkillBinding

class OnboardingSkillAdapter(
    private var items: List<SkillRow>,
    private val getRating: (String) -> Int,
    private val setRating: (String, Int) -> Unit
) : RecyclerView.Adapter<OnboardingSkillAdapter.ViewHolder>() {

    fun updateItems(newItems: List<SkillRow>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemOnboardingSkillBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val skill = items[position]
        holder.skillName.text = skill.name
        holder.seekBar.progress = (getRating(skill.id) - 1).coerceIn(0, 4)
        holder.seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser) setRating(skill.id, progress + 1)
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }

    override fun getItemCount(): Int = items.size

    class ViewHolder(binding: ItemOnboardingSkillBinding) : RecyclerView.ViewHolder(binding.root) {
        val skillName: TextView = binding.skillName
        val seekBar: SeekBar = binding.skillSeekBar
    }
}
