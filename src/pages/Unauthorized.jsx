
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-red-500">403</h1>

      <h2 className="text-2xl font-semibold mt-4">
        Access Denied
      </h2>

      <p className="text-gray-500 mt-2">
        You don't have permission to access this page.
      </p>

      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
