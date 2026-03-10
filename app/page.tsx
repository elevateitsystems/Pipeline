"use client";

import { useUser } from "@/contexts/UserContext";
import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import notFoundImg from "@/public/notFound2.png";
import editIcon from "@/public/Edit.png";
import Image from "next/image";
import {
  useAuthCheck,
  useAudits,
  useDeleteAudit,
  useSendAuditInvite,
} from "@/lib/hooks";
import { Presentation } from "@/lib/types";
import { Trash2, Play, Mail } from "lucide-react";
import toast from "react-hot-toast";
import "react-loading-skeleton/dist/skeleton.css";
import HomeSkeleton from "@/components/HomeSkeleton";
import CustomButton from "@/components/common/CustomButton";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import InviteAuditModal from "@/components/InviteAuditModal";

interface AuditWithScore extends Presentation {
  latestScore?: number;
}

export default function Home() {
  const { user, isInvitedUser, setIsInvitedUser } = useUser();
  const router = useRouter();
  const { data: authData, isLoading: authLoading } = useAuthCheck();
  const {
    data: auditsData,
    isLoading: auditsLoading,
    error: auditsError,
    refetch: refetchAudits,
  } = useAudits();
  const deleteAuditMutation = useDeleteAudit();
  const sendInviteMutation = useSendAuditInvite();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [auditToDelete, setAuditToDelete] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [auditToInvite, setAuditToInvite] = useState<{
    id: string;
    title: string;
  } | null>(null);
  console.log({ auditsData });

  useEffect(() => {
    if (!authLoading && authData) {
      if (!authData.authenticated) {
        toast.error("Please sign in to continue");
        router.push("/signin");
        return;
      }
    }
  }, [authData, authLoading, router]);

  useEffect(() => {
    if (auditsError) {
      toast.error("Failed to fetch audits. Please try again.");
    }
  }, [auditsError]);

  // Extract isInvitedUser flag from audits response
  useEffect(() => {
    if (!auditsData) return;

    const responseData = auditsData as
      | { data?: Presentation[]; isInvitedUser?: boolean }
      | Presentation[];

    if (
      responseData &&
      typeof responseData === "object" &&
      !Array.isArray(responseData) &&
      "isInvitedUser" in responseData
    ) {
      setIsInvitedUser(responseData.isInvitedUser || false);
    }
  }, [auditsData, setIsInvitedUser]);

  // Process audits to include latest score
  const audits = useMemo<AuditWithScore[]>(() => {
    if (!auditsData) return [];

    const responseData = auditsData as
      | { data?: Presentation[]; isInvitedUser?: boolean }
      | Presentation[];
    const auditsList = Array.isArray(responseData)
      ? responseData
      : responseData?.data || [];

    return auditsList.map(
      (audit: Presentation & { tests?: Array<{ totalScore: number }> }) => ({
        ...audit,
        latestScore:
          audit.tests && audit.tests.length > 0
            ? audit.tests[0].totalScore
            : undefined,
      }),
    );
  }, [auditsData]);

  const isLoading = authLoading || !user;
  const loadingAudits = auditsLoading;

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return { bg: "#f3f4f6", text: "#6b7280" };
    if (score < 30) return { bg: "#fee2e2", text: "#dc2626" }; // red
    if (score < 40) return { bg: "#fed7aa", text: "#ea580c" }; // orange
    return { bg: "#d1fae5", text: "#16a34a" }; // green
  };

  const handleDeleteClick = (id: string) => {
    setAuditToDelete(id);
    setDeleteModalOpen(true);
  };

  const clearAuditSessionStorage = () => {
    if (typeof window === "undefined") return;
    try {
      // Clear full sessionStorage
      sessionStorage.clear();

      // Dispatch event to update sidebar
      window.dispatchEvent(new Event("categoryNameUpdated"));
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  };

  // Clear sessionStorage when component mounts (user lands on home page)
  useEffect(() => {
    clearAuditSessionStorage();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!auditToDelete) return;

    try {
      await deleteAuditMutation.mutateAsync(auditToDelete);
      toast.success("Audit deleted successfully");
      setDeleteModalOpen(false);
      setAuditToDelete(null);
    } catch (error) {
      console.error("Error deleting audit:", error);
      toast.error("Failed to delete audit. Please try again.");
    }
  };

  const handleInviteClick = (audit: AuditWithScore) => {
    setAuditToInvite({ id: audit.id, title: audit.title });
    setInviteModalOpen(true);
  };

  const handleInvite = async (email: string) => {
    if (!auditToInvite) return;

    try {
      await sendInviteMutation.mutateAsync({
        email,
        presentationId: auditToInvite.id,
      });
      toast.success("Invitation sent successfully!");
    } catch (error) {
      const errorMessage =
        (
          error as {
            response?: { data?: { error?: string } };
            message?: string;
          }
        )?.response?.data?.error ||
        (error as { message?: string })?.message ||
        "Failed to send invitation";
      toast.error(errorMessage);
      throw error;
    }
  };
  useEffect(() => {
    // Refetch audits when component mounts to get the latest data
    refetchAudits();
  }, [refetchAudits]);
  if (isLoading || loadingAudits || !user) {
    return <HomeSkeleton />;
  }

  // Empty state - no audits
  if (audits.length === 0) {
    return (
      <div className="p-14 bg-white h-full">
        <div className="">
          <h1
            className="text-gray-900 mb-2 capitalize font-normal text-[20px] md:text-[24px] lg:text-[27px]"
          // style={{ fontSize: "27px", fontWeight: 400 }}
          >
            Hello, {user.name.split(" ")[0]}!
          </h1>
          <div className="flex justify-center items-center h-[80vh]">
            <div className="flex flex-col justify-center items-center ">
              <Image
                src={notFoundImg}
                alt="Logo"
                width={380}
                height={266}
                style={{
                  width: "clamp(200px, 28vw, 480px)",
                  height: "clamp(140px, 20vw, 366px)",
                  objectFit: "contain",
                }}
              />
              <p
                className="text-[#2D2D2D] mb-2 font-normal"
                style={{ fontSize: "clamp(.5rem, 4vw, 2rem)" }}
              >
                NO AUDIT CREATED
              </p>
              <p
                className="text-[20px] sm:text-[22px] xl:text-[26px] font-[300]"
              >
                {isInvitedUser
                  ? "You have been invited to take an audit. Please wait for the audit to be shared with you."
                  : "Start your first audit to see your performance insights here."}
              </p>
              {!isInvitedUser && (
                <CustomButton
                  variant="primary"
                  size="lg"
                  className="text-[18px] sm:text-[20px] lg:text-[23px] font-normal mt-4 sm:mt-6 lg:mt-10"
                  style={{
                    width: "318px",
                    height: "50px",
                    padding:
                      "clamp(0.5rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)"
                  }}
                  onClick={() => {
                    clearAuditSessionStorage();
                    router.push("/add-new-audit/?category=1");
                  }}
                >
                  Start New Audit
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Table view - audits exist
  return (
    <div className="p-14 bg-white h-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1
              className="text-[25px] lg:text-[30px] xl:text-[35px] font-normal"
              style={{
                // fontVariationSettings: "'wdth' 85, 'wght' 700",
              }}
            >
              ALL AUDIT AUDITS
            </h1>
            <p
              className="text-[20px] lg:text-[22px] xl:text-[25px]"
              style={{
                fontWeight: 300,
              }}
            >
              Track and compare all your AUDIT reports in one place. View
              scores, dates, and improvement insights instantly.
            </p>
          </div>
          <div className="flex gap-3">
            {!isInvitedUser && (
              <CustomButton
                variant="primary"
                size="lg"
                onClick={() => {
                  clearAuditSessionStorage();
                  router.push("/add-new-audit/?category=1");
                }}
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontWeight: 500,
                  fontVariationSettings: "'wdth' 85, 'wght' 500",
                }}
              >
                Create New AUDIT
              </CustomButton>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border overflow-hidden">
        <table className="w-full">
          <thead className="font-[500]">
            <tr>
              <th
                className="px-4 py-2 font-[500] border-r text-left text-sm text-[#212121] border-b"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 500,
                  fontVariationSettings: "'wdth' 85, 'wght' 600",
                }}
              >
                AUDIT Name
              </th>
              <th
                className="px-4 py-2 font-[500] border-r text-left text-sm text-[#212121] border-b"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 500,
                  fontVariationSettings: "'wdth' 85, 'wght' 600",
                }}
              >
                Creation Date
              </th>
              <th
                className="px-4 py-2 font-[500] border-r text-left text-sm text-[#212121] border-b"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 500,
                  fontVariationSettings: "'wdth' 85, 'wght' 600",
                }}
              >
                Audit Score
              </th>
              <th
                className="px-4 py-2 font-[500] border-r text-left text-sm text-[#212121] border-b"
                style={{
                  fontFamily: "'Acumin Variable Concept', sans-serif",
                  fontSize: "23px",
                  fontWeight: 500,
                  fontVariationSettings: "'wdth' 85, 'wght' 600",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="text-[#212121]">
            {audits.map((audit) => {
              const scoreColor = getScoreColor(audit.latestScore);
              return (
                <tr
                  key={audit.id}
                  className="border-b border-[#E0E0E0] font-normal"
                  style={{
                    fontFamily: "'Acumin Variable Concept', sans-serif",
                    // fontWeight: 400,
                    fontVariationSettings: "'wdth' 85, 'wght' 400",
                  }}
                >
                  <td
                    className="px-4 border-r py-4 font-[300] font-normal"
                    style={{
                      fontFamily: "'Acumin Variable Concept', sans-serif",
                      // fontWeight: 400,
                      fontSize: "23px",
                      lineHeight: "100%",
                      letterSpacing: "-0.025em",
                      fontVariationSettings: "'wdth' 85, 'wght' 400",
                    }}
                  >
                    {audit.title}
                  </td>
                  <td
                    className="px-4 border-r py-4 font-[300] font-normal"
                    style={{
                      fontFamily: "'Acumin Variable Concept', sans-serif",
                      // fontWeight: 400,
                      fontSize: "23px",
                      lineHeight: "100%",
                      letterSpacing: "-0.025em",
                      fontVariationSettings: "'wdth' 85, 'wght' 400",
                    }}
                  >
                    {formatDate(audit.createdAt)}
                  </td>
                  <td
                    className="px-4 border-r py-4 font-[300]"
                    style={
                      audit.latestScore !== undefined
                        ? { backgroundColor: scoreColor.bg }
                        : undefined
                    }
                  >
                    {audit.latestScore !== undefined ? (
                      <span
                        className="px-3 py-4 font-[300] text-center rounded font-medium"
                        style={{
                          color: scoreColor.text,
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontWeight: 400,
                          fontSize: "23px",
                          lineHeight: "100%",
                          letterSpacing: "-0.025em",
                          fontVariationSettings: "'wdth' 85, 'wght' 400",
                        }}
                      >
                        {audit.latestScore}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-1">
                    <div className={`grid ${isInvitedUser ? 'grid-cols-1' : 'grid-cols-[15%_30%_30%_25%]'} gap-2 pr-6`}>
                      {!isInvitedUser && (
                        <>
                          <button
                            onClick={() =>
                              router.push(
                                `/update-audit/?edit=${audit.id}&category=1`,
                              )
                            }
                            className="w-full px-2 py-2 text-center cursor-pointer bg-[#DBDBDB] text-black hover:bg-[#DBDBDB]/80 rounded-md flex items-center justify-center gap-1 lg:gap-1 xl:gap-1"
                            style={{
                              fontFamily:
                                "'Acumin Variable Concept', sans-serif",
                              fontWeight: 400,
                              fontSize: "24px",
                              lineHeight: "100%",
                              letterSpacing: "-0.025em",
                              fontVariationSettings: "'wdth' 85, 'wght' 400",
                            }}
                          >
                            <Image
                              src={editIcon}
                              alt="Edit"
                              width={18}
                              height={18}
                              className=""
                            />
                            <span className="">Edit</span>
                          </button>
                          <CustomButton
                            variant="redLight"
                            className="w-full text-center  py-2 lg:gap-3 xl:gap-1"
                            size="sm"
                            fullRounded={false}
                            leftIcon={<Trash2 size={18} />}
                            onClick={() => handleDeleteClick(audit.id)}
                            style={{
                              fontFamily:
                                "'Acumin Variable Concept', sans-serif",
                              fontWeight: 400,
                              fontSize: "24px",
                              lineHeight: "100%",
                              letterSpacing: "-0.025em",
                              fontVariationSettings: "'wdth' 85, 'wght' 400",
                            }}
                          >
                            Delete
                          </CustomButton>
                        </>
                      )}
                      <button
                        onClick={() =>
                          router.push(
                            `/test?presentationId=${audit.id}&category=1`,
                          )
                        }
                        className="w-full px-3 py-2 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 flex justify-center items-center gap-1 lg:gap-3 xl:gap-3"
                        style={{
                          fontFamily: "'Acumin Variable Concept', sans-serif",
                          fontWeight: 400,
                          fontSize: "24px",
                          lineHeight: "100%",
                          letterSpacing: "-0.025em",
                          fontVariationSettings: "'wdth' 85, 'wght' 400",
                        }}
                      >
                        <Play size={18} className="" />
                        Start Audit
                      </button>
                      {!isInvitedUser && (
                        <button
                          onClick={() => handleInviteClick(audit)}
                          className="w-full px-3 cursor-pointer py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 flex justify-center items-center gap-1 lg:gap-3 xl:gap-1"
                          style={{
                            fontFamily: "'Acumin Variable Concept', sans-serif",
                            fontWeight: 400,
                            fontSize: "24px",
                            lineHeight: "100%",
                            letterSpacing: "-0.025em",
                            fontVariationSettings: "'wdth' 85, 'wght' 400",
                          }}
                        >
                          <Mail size={18} />
                          Invite
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table >
      </div >

      {/* Delete Confirmation Modal */}
      < ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteAuditMutation.isPending) {
            setDeleteModalOpen(false);
            setAuditToDelete(null);
          }
        }
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Audit"
        message="Are you sure you want to delete this audit? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteAuditMutation.isPending}
      />

      {/* Invite Audit Modal */}
      {
        auditToInvite && (
          <InviteAuditModal
            isOpen={inviteModalOpen}
            onClose={() => {
              setInviteModalOpen(false);
              setAuditToInvite(null);
            }}
            onInvite={handleInvite}
            auditTitle={auditToInvite.title}
            loading={sendInviteMutation.isPending}
          />
        )
      }
    </div >
  );
}
