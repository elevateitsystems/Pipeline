"use client";

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthCheck, useAllUsers, useAllAudits } from "@/lib/hooks";
import { useAllTeams } from "@/lib/hooks/useAdmin";
import toast from "react-hot-toast";
import { Users, FileText, Search, ChevronLeft, ChevronRight, Building2, ChevronDown, ChevronUp } from "lucide-react";
import InvitedUsersModal from "@/components/InvitedUsersModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const { data: authData, isLoading: authLoading } = useAuthCheck();
  
  // Users state
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const usersLimit = 10;
  
  // Audits state
  const [auditsPage, setAuditsPage] = useState(1);
  const [auditsSearch, setAuditsSearch] = useState("");
  const [auditsSearchInput, setAuditsSearchInput] = useState("");
  const auditsLimit = 10;

  // Invited users modal state
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
    companyId: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: usersData, isLoading: usersLoading } = useAllUsers(
    usersLimit,
    usersPage,
    usersSearch
  );
  
  const { data: auditsData, isLoading: auditsLoading } = useAllAudits(
    auditsLimit,
    auditsPage,
    auditsSearch
  );

  const { data: teamsData, isLoading: teamsLoading } = useAllTeams();

  // Teams state for expand/collapse
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Check authentication and admin role
  useEffect(() => {
    if (!authLoading && authData) {
      if (!authData.authenticated) {
        toast.error("Please sign in to continue");
        router.push("/signin");
        return;
      }
      if (authData.user?.role !== "ADMIN") {
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
        return;
      }
    }
  }, [authData, authLoading, router]);

  // Handle users search
  const handleUsersSearch = () => {
    setUsersSearch(usersSearchInput);
    setUsersPage(1);
  };

  // Handle audits search
  const handleAuditsSearch = () => {
    setAuditsSearch(auditsSearchInput);
    setAuditsPage(1);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="p-14 bg-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const audits = auditsData?.audits || [];
  const teams = teamsData?.teams || [];
  const totalUsers = usersData?.total || 0;
  const totalAudits = auditsData?.total || 0;
  const totalTeams = teamsData?.total || 0;
  const usersTotalPages = usersData?.totalPages || 0;
  const auditsTotalPages = auditsData?.totalPages || 0;

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-14 bg-white h-full overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#2d3e50] text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-base">
          Manage users and monitor all audits across the platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {teamsLoading || usersLoading || auditsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton
                      width={100}
                      height={16}
                      className="mb-2"
                      baseColor="#e5e7eb"
                      highlightColor="#f3f4f6"
                    />
                    <Skeleton
                      width={60}
                      height={36}
                      baseColor="#e5e7eb"
                      highlightColor="#f3f4f6"
                    />
                  </div>
                  <Skeleton
                    circle
                    width={48}
                    height={48}
                    baseColor="#e5e7eb"
                    highlightColor="#f3f4f6"
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Teams</p>
                  <p className="text-[#2d3e50] text-3xl font-bold">{totalTeams}</p>
                </div>
                <Building2 size={48} className="text-gray-400" />
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                  <p className="text-[#2d3e50] text-3xl font-bold">{totalUsers}</p>
                </div>
                <Users size={48} className="text-gray-400" />
              </div>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Audits</p>
                  <p className="text-[#2d3e50] text-3xl font-bold">{totalAudits}</p>
                </div>
                <FileText size={48} className="text-gray-400" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Teams Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Teams</h2>
        </div>

        <div className="space-y-4">
          {teamsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Skeleton
                          circle
                          width={40}
                          height={40}
                          baseColor="#e5e7eb"
                          highlightColor="#f3f4f6"
                        />
                        <div className="flex-1">
                          <Skeleton
                            width={200}
                            height={20}
                            className="mb-2"
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                          <Skeleton
                            width={150}
                            height={16}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Skeleton
                            width={80}
                            height={14}
                            className="mb-1"
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                          <Skeleton
                            width={40}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </div>
                        <Skeleton
                          width={20}
                          height={20}
                          baseColor="#e5e7eb"
                          highlightColor="#f3f4f6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : teams.length === 0 ? (
            <div className="border border-gray-300 rounded-lg p-8 text-center text-gray-500">
              No teams found
            </div>
          ) : (
            teams.map((team) => {
              const isExpanded = expandedTeams.has(team.id);
              return (
                <div
                  key={team.id}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                >
                  {/* Team Header */}
                  <div
                    className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleTeam(team.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {team.logoUrl && (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {team.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                            {team.totalMembers > team.memberCount && (
                              <span className="ml-1">
                                ({team.totalMembers - team.memberCount} invited)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Audits</p>
                          <p className="text-lg font-semibold text-gray-800">
                            {team.audits.length}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={20} className="text-gray-600" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="bg-white">
                      {/* Members List */}
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Members ({team.members.length})
                        </h4>
                        {team.members.length === 0 ? (
                          <p className="text-gray-500 text-sm">No members in this team</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {team.members.map((member: any) => (
                              <div
                                key={member.id}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-800 truncate">
                                        {member.name}
                                      </p>
                                      <p className="text-xs text-gray-600 truncate mt-0.5">
                                        {member.email}
                                      </p>
                                      {member.companyRole && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {member.companyRole}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        member.role === "ADMIN"
                                          ? "bg-[#F7AF41] text-black"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {member.role}
                                    </span>
                                    {member.isInvited && (
                                      <span className="text-xs text-blue-600 font-medium">
                                        Invited
                                      </span>
                                    )}
                                    {member.auditCount > 0 && (
                                      <span className="text-xs text-gray-500">
                                        {member.auditCount} {member.auditCount === 1 ? "audit created" : "audits created"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Audits List */}
                      <div className="px-6 py-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Audits ({team.audits.length})
                        </h4>
                        {team.audits.length === 0 ? (
                          <p className="text-gray-500 text-sm">No audits assigned to this team</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Audit Title
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Created By
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Assigned Members
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Tests
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Latest Score
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                                    Created
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {team.audits.map((audit: any) => (
                                  <tr
                                    key={audit.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                      {audit.title}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      <div>
                                        <p className="font-medium">{audit.userName}</p>
                                        <p className="text-xs text-gray-500">{audit.userEmail}</p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {audit.assignedMembers && audit.assignedMembers.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                          {audit.assignedMembers.map((member: any) => (
                                            <span
                                              key={member.id}
                                              className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium"
                                              title={member.email}
                                            >
                                              {member.name}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {audit.testCount}
                                    </td>
                                    <td className="px-4 py-3">
                                      {audit.latestScore !== undefined ? (
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-medium ${
                                            audit.latestScore < 30
                                              ? "bg-red-100 text-red-700"
                                              : audit.latestScore < 40
                                              ? "bg-orange-100 text-orange-700"
                                              : "bg-[#d1fae5] text-[#16a34a]"
                                          }`}
                                        >
                                          {audit.latestScore}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {formatDate(audit.createdAt)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Users Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Users</h2>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={usersSearchInput}
                onChange={(e) => setUsersSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleUsersSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <button
              onClick={handleUsersSearch}
              className="px-4 py-2 bg-[#F7AF41] text-black rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

                        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Sign Up Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800">{user.name}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser({
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              companyId: (user as any).companyId || '',
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {user.email}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {(user as any).company?.name || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "ADMIN"
                              ? "bg-[#F7AF41] text-black"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination for Users */}
          {usersTotalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t">
              <div className="text-sm text-gray-600">
                Page {usersPage} of {usersTotalPages} ({totalUsers} total users)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                  disabled={usersPage === usersTotalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audits Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">All Audits</h2>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search audits..."
                value={auditsSearchInput}
                onChange={(e) => setAuditsSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAuditsSearch()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
            <button
              onClick={handleAuditsSearch}
              className="px-4 py-2 bg-[#F7AF41] text-black rounded-lg hover:opacity-90 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

                        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Audit Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Tests Taken
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Latest Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {auditsLoading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-[#E0E0E0]">
                        <td className="px-6 py-4">
                          <Skeleton
                            width={200}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton
                            width={150}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton
                            width={120}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton
                            width={40}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton
                            width={50}
                            height={24}
                            className="rounded"
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton
                            width={100}
                            height={20}
                            baseColor="#e5e7eb"
                            highlightColor="#f3f4f6"
                          />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : audits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No audits found
                    </td>
                  </tr>
                ) : (
                  audits.map((audit) => {
                    const latestTest = audit.tests?.[0];
                    const testCount = (audit as any)._count?.tests || 0;
                    return (
                      <tr
                        key={audit.id}
                        className="border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-800 font-medium">
                          {audit.title}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {(audit as any).user?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {(audit as any).user?.company?.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{testCount}</td>
                        <td className="px-6 py-4">
                          {latestTest?.totalScore !== undefined ? (
                            <span
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                latestTest.totalScore < 30
                                  ? "bg-red-100 text-red-700"
                                  : latestTest.totalScore < 40
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-[#d1fae5] text-[#16a34a]"
                              }`}
                            >
                              {latestTest.totalScore}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(audit.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination for Audits */}
          {auditsTotalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t">
              <div className="text-sm text-gray-600">
                Page {auditsPage} of {auditsTotalPages} ({totalAudits} total audits)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAuditsPage((p) => Math.max(1, p - 1))}
                  disabled={auditsPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setAuditsPage((p) => Math.min(auditsTotalPages, p + 1))}
                  disabled={auditsPage === auditsTotalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invited Users Modal */}
      {selectedUser && (
        <InvitedUsersModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          companyId={selectedUser.companyId}
        />
      )}
    </div>
  );
}

