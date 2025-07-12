"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availability, setAvailability] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        setIsAuthenticated(data.success);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
  setLoading(true); // Start loading before fetching

  // Build query string dynamically
  const query = new URLSearchParams({
    type: 'public',
    page: currentPage,
    limit: 5,
    search: searchTerm,
  });

  if (availability) {
    query.append('availability', availability);
  }

  fetch(`/api/users?${query.toString()}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.totalPages);
      }
      setLoading(false); // End loading after fetch
    })
    .catch(() => setLoading(false));
}, [availability, currentPage, searchTerm]);


  const handleRequest = (user) => {
    if (!isAuthenticated) {
      router.push(`/login`)
    } else {
      router.push(`/user?_id=${user._id}`)
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="animate-pulse bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))
  );

  return (
    <>
    <Navbar />
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Browse Public Profiles</h1>
      </div>

 <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
  <div className="relative w-full md:w-52"> 
      <select
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        className="appearance-none w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <option value="">Availability</option>
        <option value="weekends">Weekends</option>
        <option value="weekdays">Weekdays</option>
        <option value="mornings">Mornings</option>
        <option value="evenings">Evenings</option>
        <option value="nights">Nights</option>
      </select>
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>

  <div className="relative flex-1 w-full">
    <input
      type="text"
      placeholder="Search skill..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-5 py-3 text-sm border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
      </svg>
    </div>
  </div>

  <button
    onClick={() => setCurrentPage(1)}
    className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-tr from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-2xl shadow-md transition-all"
  >
    Search
  </button>
</div>


     {/* Skeleton or Actual Users */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {loading ? (
    renderSkeleton()
  ) : (
    users.map((user, index) => (
      <div
        key={index}
        className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-inner">
            <img
              src={user.profilePhoto || "/images/avatar.png"}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 w-full">
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-sm text-green-600 mt-1">
              Skills Offered:{" "}
              <span className="text-gray-700">{user.skillsOffered?.join(", ")}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Skills Wanted:{" "}
              <span className="text-gray-700">{user.skillsWanted?.join(", ")}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Rating:{" "}
              <span className="text-yellow-500 font-medium">{user.rating ?? "N/A"} / 5</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => handleRequest(user)}
            className="bg-gradient-to-tr hover:cursor-pointer from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform text-sm font-medium"
          >
            See Profile
          </button>
            <button
            onClick={() => handleRequest(user)}
            className="bg-gradient-to-tr hover:cursor-pointer from-blue-500 to-cyan-500 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform text-sm font-medium"
          >
            Request
          </button>
        </div>
      </div>
    ))
  )}
</div>


      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
    </>
  );
}
