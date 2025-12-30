import { useState } from "react";

const ReviewModal = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isAnonymous, setAnonymous] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[380px] rounded-2xl bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-center text-lg font-semibold">Rate Manoj</h2>

        {/* Avatar */}
        <div className="mt-4 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="h-10 w-10 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </div>
        </div>

        {/* User info */}
        <div className="mt-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
            </svg>
          </div>
          <div>
            <p className="font-medium">Latif</p>
            <p className="text-xs text-gray-500">
              Reviews are public if you are not anonymous
            </p>
          </div>
        </div>

        {/* Anonymous checkbox */}
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
          />
          Hide my name from all public reviews
        </label>

        {/* Rating stars */}
        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Review textarea */}
        <div className="mt-4">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value.slice(0, 160))}
            placeholder="Describe your experience (optional)"
            className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-yellow-500 focus:outline-none"
            rows={3}
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {review.length}/160
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() =>
            onSubmit({ rating, review, isAnonymous })
          }
          disabled={!rating}
          className={`mt-4 w-full rounded-lg py-3 font-medium transition ${
            rating
              ? "bg-yellow-400 text-black hover:bg-yellow-500"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;
