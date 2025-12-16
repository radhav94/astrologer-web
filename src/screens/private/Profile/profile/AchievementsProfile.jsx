import { useState, useEffect } from "react";
import { Button, Toggle, SectionHeader } from "./ui";
import { Plus } from "lucide-react";

const AchievementsProfile = () => {
  // 🔥 FORCE SCROLL TO TOP – WORKS IN ALL DASHBOARD LAYOUTS
  useEffect(() => {
    // Window
    window.scrollTo(0, 0);

    // Document
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Any scrollable container
    const scrollables = document.querySelectorAll("*");
    scrollables.forEach((el) => {
      if (el.scrollTop) el.scrollTop = 0;
    });
  }, []);

  const [bio, setBio] = useState(
    "With years of dedicated practice, I've guided thousands of individuals across love, career, health, and life direction. My work combines classical Vedic principles with deep intuitive understanding, helping clients receive guidance."
  );

  const [displayOnProfile, setDisplayOnProfile] = useState(false);
  const [attachments, setAttachments] = useState([1, 2, 3, 4, 5, 6]);

  const handleAddAttachment = () => {
    setAttachments([...attachments, attachments.length + 1]);
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader title="Achievements" />

      <div className="flex-1">
        {/* BIO */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full h-40 p-4 rounded-xl border border-gray-300 text-gray-600 italic"
        />

        {/* ATTACHMENTS */}
        <div className="mt-6">
          <label className="text-sm font-medium">Attachments</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {attachments.map((id) => (
              <div key={id} className="aspect-square bg-gray-300 rounded-lg" />
            ))}
            <button
              onClick={handleAddAttachment}
              className="aspect-square bg-gray-300 rounded-lg flex items-center justify-center"
            >
              <Plus />
            </button>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="mt-6">
          <Toggle
            label="Display on Profile"
            checked={displayOnProfile}
            onChange={setDisplayOnProfile}
          />
        </div>
      </div>

      <div className="mt-6">
        <Button>Save</Button>
      </div>
    </div>
  );
};

export default AchievementsProfile;
