import { IoStop, IoClose } from "react-icons/io5";

const VoiceRecorderPopup = ({ seconds, onStop, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      <div className="
        bg-white rounded-2xl shadow-xl
        px-8 py-6 w-[300px]
        flex flex-col items-center gap-6
      ">
        
        {/* Title */}
        <p className="text-sm font-medium text-gray-700">
          Recording voice message
        </p>

        {/* Waves */}
        <div className="flex items-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className="w-1 bg-blue-600 rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-lg font-semibold text-gray-800">
          {seconds < 10 ? `0:0${seconds}` : `0:${seconds}`}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          {/* Cancel */}
          <button
            onClick={onCancel}
            className="
              w-10 h-10 rounded-full
              bg-gray-200 text-gray-700
              flex items-center justify-center
              hover:bg-gray-300
            "
          >
            <IoClose size={18} />
          </button>

          {/* Stop */}
          <button
            onClick={onStop}
            className="
              px-6 py-2 rounded-full
              bg-red-600 text-white
              flex items-center gap-2
              hover:bg-red-700
            "
          >
            <IoStop />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorderPopup;
