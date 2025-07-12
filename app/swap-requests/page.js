'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sent'); // "sent" | "received" | "completed"
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);



  const updateRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch('/api/skillswap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });

      const data = await res.json();
      if (data.success) {
        // Update the UI immediately without full refetch
        setReceivedRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status } : r))
        );
      } else {
        console.error('Failed to update status:', data.msg);
        alert('Something went wrong updating the request');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Server error while updating request');
    }
  };


  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      try {
        const [sentRes, receivedRes] = await Promise.all([
          fetch(`/api/skillswap?userId=${currentUser._id}&role=sent`),
          fetch(`/api/skillswap?userId=${currentUser._id}&role=received`),
        ]);
        const sentData = await sentRes.json();
        const receivedData = await receivedRes.json();

        if (sentData.success) setSentRequests(sentData.requests);
        if (receivedData.success) setReceivedRequests(receivedData.requests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [currentUser]);

  const isComplete = (req) => req.status === 'completed';

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading your skill swap requests...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Skill Swap Requests</h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => setTab('sent')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
        >
          📤 Sent
        </button>
        <button
          onClick={() => setTab('received')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'received' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
        >
          📥 Received
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'completed' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
        >
          ✅ Completed
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'sent' && (
        <div>
          <h2 className="text-xl font-semibold text-blue-600 mb-4">📤 Requests Sent</h2>
          {sentRequests.length === 0 ? (
            <p className="text-gray-500">You haven’t sent any requests yet.</p>
          ) : (
            <ul className="space-y-4">
              {sentRequests.map((req) => (
                <li key={req._id} className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={req.toUser.profilePhoto || '/images/avatar.png'} className="w-10 h-10 rounded-full border object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">
                          To: <Link href={`/user?_id=${req.toUser._id}`} className="text-blue-700">{req.toUser.name}</Link>
                        </p>
                        <p className="text-sm text-gray-600">
                          Offered: <strong>{req.offeredSkill}</strong> | Wanted: <strong>{req.wantedSkill}</strong>
                        </p>
                        {req.message && <p className="text-sm text-gray-500 mt-1">“{req.message}”</p>}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-700'
                      : req.status === 'rejected' ? 'bg-red-100 text-red-600'
                        : req.status === 'completed' ? 'bg-purple-100 text-purple-700'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      {req.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'received' && (
        <div>
          <h2 className="text-xl font-semibold text-green-600 mb-4">📥 Requests Received</h2>
          {receivedRequests.length === 0 ? (
            <p className="text-gray-500">No one has sent you a request yet.</p>
          ) : (
            <ul className="space-y-4">
              {receivedRequests.map((req) => (
                <li key={req._id} className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={req.fromUser.profilePhoto || '/images/avatar.png'} className="w-10 h-10 rounded-full border object-cover" />
                      <div>
                        <p className="font-medium text-gray-800">
                          From: <Link href={`/user?_id=${req.fromUser._id}`} className="text-green-700">{req.fromUser.name}</Link>
                        </p>
                        <p className="text-sm text-gray-600">
                          They Offer: <strong>{req.offeredSkill}</strong> | They Want: <strong>{req.wantedSkill}</strong>
                        </p>
                        {req.message && <p className="text-sm text-gray-500 mt-1">“{req.message}”</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full block mb-2 ${req.status === 'accepted' ? 'bg-green-100 text-green-700'
                        : req.status === 'rejected' ? 'bg-red-100 text-red-600'
                          : req.status === 'completed' ? 'bg-purple-100 text-purple-700'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                        {req.status}
                      </span>
                      {req.status === 'pending' && (
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => updateRequestStatus(req._id, 'completed')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req._id, 'rejected')}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === 'completed' && (
        <div>
          <h2 className="text-xl font-semibold text-purple-600 mb-4">✅ Completed Requests</h2>
          {sentRequests.concat(receivedRequests).filter(isComplete).length === 0 ? (
            <p className="text-gray-500">No completed requests yet.</p>
          ) : (
            <ul className="space-y-6">
              {sentRequests.concat(receivedRequests).filter(isComplete).map((req) => {
                const feedback = feedbacks[req._id] || { rating: 0, text: '' };
                const isFromMe = req.fromUser._id === currentUser._id;
                const myFeedback = isFromMe ? req.fromFeedback : req.toFeedback;
                const theirFeedback = isFromMe ? req.toFeedback : req.fromFeedback;
                const otherUser = isFromMe ? req.toUser : req.fromUser;

                const handleStarClick = (stars) => {
                  setFeedbacks((prev) => ({
                    ...prev,
                    [req._id]: { ...prev[req._id], rating: stars }
                  }));
                };

                const handleFeedbackChange = (e) => {
                  setFeedbacks((prev) => ({
                    ...prev,
                    [req._id]: { ...prev[req._id], text: e.target.value }
                  }));
                };

                return (
                  <li key={req._id} className="bg-purple-50 border border-purple-200 p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <img src={otherUser.profilePhoto || '/images/avatar.png'} className="w-12 h-12 rounded-full border object-cover" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {isFromMe ? (
                              <>To: <Link href={`/user?_id=${req.toUser._id}`} className="text-blue-700">{req.toUser.name}</Link></>
                            ) : (
                              <>From: <Link href={`/user?_id=${req.fromUser._id}`} className="text-green-700">{req.fromUser.name}</Link></>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Offered: <strong>{req.offeredSkill}</strong> | Wanted: <strong>{req.wantedSkill}</strong>
                          </p>
                          {req.message && <p className="text-sm text-gray-500 mt-1">“{req.message}”</p>}
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 h-fit">Completed</span>
                    </div>

                    {/* Received Feedback */}
                    {theirFeedback?.rating && (
                      <div className="bg-white border border-gray-200 p-3 rounded-md shadow-inner">
                        <p className="text-sm text-gray-700 mb-1 font-semibold">Feedback You Received:</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-xl ${theirFeedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">“{theirFeedback.comment}”</p>
                      </div>
                    )}

                    {/* Given Feedback */}
                    {myFeedback?.rating ? (
                      <div className="bg-white border border-purple-200 p-3 rounded-md shadow-inner">
                        <p className="text-sm text-gray-700 mb-1 font-semibold">Your Feedback:</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-xl ${myFeedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">“{myFeedback.comment}”</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleStarClick(star)}
                              className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          rows="3"
                          value={feedback.text}
                          onChange={handleFeedbackChange}
                          placeholder="Leave a short feedback..."
                          className="w-full mt-2 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <div className="text-right mt-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/skillswap', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    requestId: req._id,
                                    userId: currentUser._id,
                                    feedback: {
                                      rating: feedback.rating,
                                      comment: feedback.text,
                                    }
                                  }),
                                });

                                const data = await res.json();
                                if (data.success) {
                                  alert("✅ Feedback submitted!");
                                  location.reload();
                                } else {
                                  alert("❌ Failed to submit feedback");
                                }
                              } catch (err) {
                                console.error("Error submitting feedback:", err);
                                alert("❌ Error occurred");
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-md shadow-md transition"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}



    </div>
  );
};

export default Page;
