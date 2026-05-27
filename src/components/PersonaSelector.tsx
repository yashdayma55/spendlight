"use client";

import { useState } from "react";

const PERSONAS = [
  {
    id: "journalist",
    emoji: "📰",
    label: "Journalist",
    description: "I'm investigating spending trends",
    starterQuestions: [
      "What's the most surprising finding in this data?",
      "Which vendors got the most public money?",
      "Are there any unusual spending spikes?",
      "How does healthcare spending compare to education?",
    ],
  },
  {
    id: "councilmember",
    emoji: "🏛️",
    label: "City Official",
    description: "I need to understand where money went",
    starterQuestions: [
      "Which agency spent the most money?",
      "How much went to grants vs goods and services?",
      "What did the Transportation department spend on?",
      "How did spending change month to month?",
    ],
  },
  {
    id: "analyst",
    emoji: "📊",
    label: "Policy Analyst",
    description: "I'm researching spending patterns",
    starterQuestions: [
      "What share of spending is grants vs contracts?",
      "Which months had the highest spending?",
      "How is the Health Care Authority budget broken down?",
      "What are the top 5 vendors by total payment?",
    ],
  },
  {
    id: "citizen",
    emoji: "👤",
    label: "Curious Citizen",
    description: "I want to understand public spending",
    starterQuestions: [
      "Where does most of the money go?",
      "How much does Washington spend on healthcare?",
      "What companies does the state pay the most?",
      "Is this spending normal compared to other states?",
    ],
  },
] as const;

export type Persona = (typeof PERSONAS)[number];

export default function PersonaSelector({
  onSelect,
}: {
  onSelect: (persona: Persona) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (persona: Persona) => {
    setSelected(persona.id);
    onSelect(persona);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Who are you? 👋
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Tell us who you are and we&apos;ll tailor the experience for you.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => handleSelect(persona)}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:border-blue-300 hover:bg-blue-50 ${
              selected === persona.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="text-2xl mb-2">{persona.emoji}</div>
            <div className="text-sm font-semibold text-gray-800">
              {persona.label}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {persona.description}
            </div>
          </button>
        ))}
      </div>
      {selected && (
        <p className="text-xs text-blue-600 mt-3 font-medium">
          ✓ Great! We&apos;ve personalized your starter questions below. Scroll
          down to the chat to get started.
        </p>
      )}
    </div>
  );
}

export { PERSONAS };
