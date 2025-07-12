'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import useAuthCheck from '@/components/useAuthCheck';

const User = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('_id');
  const [currentUser, setCurrentUser] = useState(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    offeredSkill: '',
    wantedSkill: '',
    message: '',
  });
 



  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);


  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users?_id=${userId}`);
        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading user profile...</div>;
  if (!user) return <div className="text-center mt-10 text-red-500">User not found.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !user) {
      alert("User data is missing.");
      return;
    }

    const payload = {
      fromUser: currentUser._id,
      toUser: user._id,
      offeredSkill: form.offeredSkill,
      wantedSkill: form.wantedSkill,
      message: form.message,
    };

    try {
      const res = await fetch('/api/skillswap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Skill swap request sent successfully!");
        setShowModal(false);
        setForm({ offeredSkill: '', wantedSkill: '', message: '' }); // Reset form
      } else {
        alert(`Error: ${data.msg}`);
      }
    } catch (error) {
      console.error("Skill swap submission error:", error);
      alert("An error occurred while sending the request.");
    }
  };


  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={user.profilePhoto || '/images/avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border"
          />

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <p className="text-sm text-gray-500 mb-1"><strong>Location:</strong> {user.location || 'Not specified'}</p>
            <p className="text-sm text-gray-500 mb-1"><strong>Profile Type:</strong> {user.profileType}</p>
            <p className="text-sm text-gray-500 mb-4"><strong>Availability:</strong> {user.availability?.length > 0 ? user.availability.join(', ') : 'Not specified'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-green-600 mb-1">Skills Offered</p>
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered.length > 0 ? (
                    user.skillsOffered.map((skill, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </div>
              </div>

              <div>
                <p className="font-semibold text-blue-600 mb-1">Skills Wanted</p>
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted.length > 0 ? (
                    user.skillsWanted.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">⭐ User Ratings & Reviews</h3>
          <div className="flex items-center mb-2">
            <div className="text-yellow-500 text-xl">★★★★☆</div>
            <span className="ml-2 text-sm text-gray-600">(4.0 / 5 based on 12 reviews)</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>"Very helpful and skilled!" — Alice</li>
            <li>"Would definitely trade again." — Bob</li>
            <li>"Great communication." — Charlie</li>
          </ul>
        </div>

        {/* Send Request Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-semibold shadow-md transition"
          >
            Send Skill Swap Request
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-gray-100 bg-opacity-100 flex justify-center items-center">
            <div className="bg-white w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl relative">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Send Skill Swap Request</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Choose one of your offered skills</label>
                  <select
                    required
                    value={form.offeredSkill}
                    onChange={(e) => setForm({ ...form, offeredSkill: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Select Skill --</option>
                    {currentUser?.skillsOffered?.map((skill, idx) => (
                      <option key={idx} value={skill}>{skill}</option>
                    )) || <option disabled>Loading...</option>}

                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm text-gray-600">Choose one of their wanted skills</label>
                  <select
                    required
                    value={form.wantedSkill}
                    onChange={(e) => setForm({ ...form, wantedSkill: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Select Skill --</option>
                    {user.skillsWanted.map((skill, idx) => (
                      <option key={idx} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-sm text-gray-600">Message</label>
                  <textarea
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Write a short message..."
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 text-sm hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default User;
