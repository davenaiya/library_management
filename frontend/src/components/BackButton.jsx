import { useLocation, useNavigate } from "react-router-dom";

function BackButton({ fallbackTo = "/books", className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const nextPath = location.state?.from?.pathname || fallbackTo;
    navigate(nextPath, { replace: true });
  };

  return (
    <button type="button" className={`btn-secondary ${className}`.trim()} onClick={handleBack}>
      <span className="mr-2" aria-hidden="true">←</span>Back
    </button>
  );
}

export default BackButton;
