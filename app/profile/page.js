    "use client";
    import { useState, useEffect } from "react";
    import { useRouter } from "next/navigation";

    export default function Profile() {
        const router = useRouter();

        const [name, setName] = useState("");
        const [email, setEmail] = useState("");
        const [location, setLocation] = useState("");
        const [skillsOffered, setSkillsOffered] = useState([]);
        const [skillsWanted, setSkillsWanted] = useState([]);
        const [availability, setAvailability] = useState("weekends");
        const [profileVisibility, setProfileVisibility] = useState("public");
        const [photo, setPhoto] = useState(null);
        const [offeredInput, setOfferedInput] = useState("");
        const [wantedInput, setWantedInput] = useState("");

        useEffect(() => {
            const fetchUserProfile = async () => {
                try {
                    const authRes = await fetch("/api/auth");
                    const authData = await authRes.json();

                    if (!authData.success || !authData.user) {
                        router.push("/login");
                        return;
                    }

                    const userID = authData.user._id;
                    setEmail(authData.user.email);

                    const userRes = await fetch(`/api/users?_id=${userID}`);
                    const userData = await userRes.json();

                    if (userData.success) {
                        const user = userData.user;
                        setName(user.name);
                        setLocation(user.location);
                        setSkillsOffered(user.skillsOffered || []);
                        setSkillsWanted(user.skillsWanted || []);
                        setAvailability(user.availability);
                        setProfileVisibility(user.profileType);
                        setPhoto(user.profilePhoto);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };

            fetchUserProfile();
        }, [router]);

        const handleSave = async () => {
            const res = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    email,
                    location,
                    skillsOffered,
                    skillsWanted,
                    availability,
                    profileType: profileVisibility,
                    profilePhoto: photo,
                }),
            });

            const data = await res.json();
            if (data.success) alert("Profile updated successfully!");
        };

        const removeSkill = (type, index) => {
            if (type === "offered") {
                setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
            } else {
                setSkillsWanted(skillsWanted.filter((_, i) => i !== index));
            }
        };

        const addSkill = (type, value, setter) => {
            const skill = value.trim();
            if (!skill) return;
            if (type === "offered") setSkillsOffered([...skillsOffered, skill]);
            else setSkillsWanted([...skillsWanted, skill]);
            setter("");
        };

        return (
            <div className="max-w-4xl mx-auto px-4 py-10 bg-white shadow-xl border-gray-100 border rounded-lg mt-10">
                <div className="flex justify-between items-center">
                </div>
                <div className="flex items-center gap-6 bg-white shadow-md p-6 rounded-xl mb-8">
                    {/* Left: Profile Photo */}
                    <div className="flex-shrink-0 text-center">
                        <img
                            src={photo || "/images/avatar.png"}
                            alt="Profile"
                            className="w-28 h-28 rounded-full object-cover mx-auto"
                        />
                        <div className="flex justify-center gap-4 mt-3">
                            <button className="text-sm text-blue-600 hover:underline">Add/Edit</button>
                            <button
                                className="text-sm text-red-600 hover:underline"
                                onClick={() => setPhoto(null)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>

                    {/* Right: Name, Email & Actions */}
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold">{name || "Your Name"}</h2>
                        <p className="text-gray-600 mb-4">{email}</p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="/"
                                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Home
                            </a>
                            <a
                                href="/swap-requests"
                                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Swap Requests
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Email (non-editable)</label>
                        <input
                            value={email}
                            disabled
                            className="w-full px-4 py-2 border bg-gray-100 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Location</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Availability</label>
                        <select
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="weekends">Weekends</option>
                            <option value="evenings">Evenings</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Skills Offered</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {skillsOffered.map((skill, idx) => (
                                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    {skill} <button onClick={() => removeSkill("offered", idx)} className="ml-1">&times;</button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={offeredInput}
                            onChange={(e) => setOfferedInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addSkill("offered", offeredInput, setOfferedInput)}
                            placeholder="Add a skill and press Enter"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Skills Wanted</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {skillsWanted.map((skill, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    {skill} <button onClick={() => removeSkill("wanted", idx)} className="ml-1">&times;</button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={wantedInput}
                            onChange={(e) => setWantedInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addSkill("wanted", wantedInput, setWantedInput)}
                            placeholder="Add a skill and press Enter"
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Profile Visibility</label>
                        <select
                            value={profileVisibility}
                            onChange={(e) => setProfileVisibility(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div className="space-x-4 flex items-end">

                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => router.refresh()}
                            className="px-4 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                        >
                            Discard
                        </button>
                    </div>

                </div>
            </div>
        );
    }