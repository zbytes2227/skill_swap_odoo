"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth', {
          method: 'GET',
        });
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    fetch(`/api/users?type=public&page=${currentPage}&limit=5&search=${searchTerm}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
        }
      });
  }, [currentPage, searchTerm]);

  const handleRequest = (user) => {
    if (!isAuthenticated) {
      router.push(`/login`)
    }else{
      router.push(`/user?_id=${user._id}`)
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Browse Public Profiles</h1>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 mb-8">
        <select className="border px-3 py-2 rounded-lg w-full md:w-48">
          <option>Availability</option>
          <option>Weekends</option>
          <option>Evenings</option>
        </select>
        <input
          type="text"
          placeholder="Search skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full flex-1 shadow-sm"
        />
        <button
          onClick={() => setCurrentPage(1)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {users.map((user, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-sm">
              Photo
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-700">{user.name}</h2>
              <p className="text-sm text-green-600 mt-1">Skills Offered: <span className="text-gray-800">{user.skillsOffered?.join(", ")}</span></p>
              <p className="text-sm text-blue-600 mt-1">Skills Wanted: <span className="text-gray-800">{user.skillsWanted?.join(", ")}</span></p>
              <p className="text-sm text-gray-600 mt-1">Rating: <span className="text-yellow-600 font-medium">{user.rating ?? "N/A"} / 5</span></p>
            </div>
            <button
              className="bg-gradient-to-r from-sky-400 to-sky-500 text-white px-6 py-2 rounded-full shadow hover:scale-105 transition-transform"
              onClick={() => handleRequest(user)}
            >
              Request
            </button>
          </div>
        </div>
      ))}

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
  );
}