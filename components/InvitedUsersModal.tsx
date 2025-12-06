"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInvitedUsers } from "@/lib/hooks/useAdmin";
import { User } from "@/lib/types";

interface InvitedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string;
  userEmail: string;
  companyId: string;
}

export default function InvitedUsersModal({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
  companyId,
}: InvitedUsersModalProps) {
  const { data, isLoading, error } = useInvitedUsers(userId);

  // Users are already filtered by companyId on the server side
  const invitedUsers = data?.users || [];

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group users by company
  const usersByCompany = React.useMemo(() => {
    const grouped: Record<string, User[]> = {};
    
    invitedUsers.forEach((user: User) => {
      const companyName = (user as any).company?.name || "No Company";
      if (!grouped[companyName]) {
        grouped[companyName] = [];
      }
      grouped[companyName].push(user);
    });

    // Sort companies alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as Record<string, User[]>);
  }, [invitedUsers]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#2d3e50] text-2xl font-bold">
            Invited Users
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Users invited by <span className="font-semibold">{userName}</span> (
            {userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Loading invited users...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">
              Failed to load invited users. Please try again.
            </div>
          ) : invitedUsers.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No invited users found for this user.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(usersByCompany).map(([companyName, users]) => (
                <div key={companyName} className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Company Header */}
                  <div className="bg-[#F7AF41] px-6 py-3 border-b border-gray-300">
                    <h3 className="text-lg font-semibold text-black">
                      {companyName}
                      <span className="ml-2 text-sm font-normal text-gray-700">
                        ({users.length} {users.length === 1 ? "user" : "users"})
                      </span>
                    </h3>
                  </div>
                  
                  {/* Users Table */}
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
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                            Sign Up Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: User) => (
                          <tr
                            key={user.id}
                            className="border-b border-[#E0E0E0] hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-800">{user.name}</td>
                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

