import { useNavigate } from "react-router-dom";
import { useCall } from "../../../../context/CallContext";
import { useAddUserReviewMutation } from "../../../../redux/review/reviewApi";
import { Toast } from "../../../../components";
import ReviewModal from "./ReviewModal";

const StickyReviewFooter = () => {
  const {
    openReview,
    setOpenReview,
    reviewData
  } = useCall();
  const navigate = useNavigate();
  const [addUserReview] = useAddUserReviewMutation();

  if (!openReview)
    return null;

  const handleReviewSubmit = async ({ rating, review, isAnonymous }) => {
    try {
      const res = await addUserReview({
        userID: reviewData?.userID,
        rating,
        review,
        isAnonymous,
      }).unwrap();

      if (res.success) {
        Toast.success(res.message);
        navigate(-1); // or home
      } else {
        Toast.error(res.message);
      }

      setOpenReview(false);
    } catch (err) {
      Toast.error("Failed to submit review");
    }
  };

  return (
    <div>
      {openReview &&
        <ReviewModal
          onClose={() => setOpenReview(false)}
          onSubmit={handleReviewSubmit}
          ratedUserName={reviewData?.fullName}
          reviewerName="You"
        />}
    </div>
  );
};

export default StickyReviewFooter;
