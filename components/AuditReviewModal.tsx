"use client";

import React, { useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAudit, useAuditProgress } from "@/lib/hooks";
import { Presentation } from "@/lib/types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface AuditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    auditId: string | null;
    auditTitle: string;
}

export default function AuditReviewModal({
    isOpen,
    onClose,
    auditId,
    auditTitle,
}: AuditReviewModalProps) {
    const { data: auditData, isLoading: auditLoading } = useAudit(auditId);
    const { data: progressData, isLoading: progressLoading } =
        useAuditProgress(auditId);

    const answers = progressData?.answers || {};

    const getPointsColor = (points: number) => {
        switch (points) {
            case 1:
                return { bg: "bg-[#FFE2E380]", text: "#A51A1F", label: "Very Minimal" };
            case 2:
                return { bg: "bg-[#FFFCE280]", text: "#776E23", label: "Just Starting" };
            case 3:
                return { bg: "bg-[#FFDBC2B2]", text: "#894B00", label: "Good progress" };
            case 4:
                return { bg: "bg-[#DCFCE7]", text: "#016730", label: "Excellent" };
            case 5:
                return { bg: "bg-[#DCF3F6]", text: "#1E40AF", label: "Very Excellent" };
            default:
                return { bg: "bg-gray-100", text: "#6b7280", label: "-" };
        }
    };

    const isLoading = auditLoading || progressLoading;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[80vw]! bg-white lg:w-[50vw]! sm:max-w-none! max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#2d3e50]">
                        Audit Review: {auditTitle}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="space-y-4 py-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton height={24} width="40%" />
                                <Skeleton height={60} width="100%" />
                            </div>
                        ))}
                    </div>
                ) : !auditData ? (
                    <div className="py-10 text-center text-gray-500">
                        Failed to load audit data.
                    </div>
                ) : (
                    <div className="space-y-8 py-4">
                        {auditData.categories.map((category) => (
                            <div key={category.id} className="space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    {category.icon && (
                                        <span className="text-2xl">{category.icon}</span>
                                    )}
                                    {category.name}
                                </h3>
                                <div className="space-y-4">
                                    {category.questions.map((question, index) => {
                                        const selectedOptionId = answers[question.id];
                                        const selectedOption = question.options.find(
                                            (opt) => opt.id === selectedOptionId
                                        );
                                        const points = selectedOption?.points || 0;
                                        const style = getPointsColor(points);

                                        return (
                                            <div
                                                key={question.id}
                                                className="grid grid-cols-[40px_1fr_200px] gap-4 items-start p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="text-gray-400 font-medium pt-1">
                                                    {index + 1}
                                                </div>
                                                <div className="text-gray-800 text-lg">
                                                    {question.text}
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    {selectedOption ? (
                                                        <>
                                                            <div
                                                                className={`px-3 py-1.5 rounded-md text-sm font-semibold border ${style.bg}`}
                                                                style={{ color: style.text }}
                                                            >
                                                                {selectedOption.text}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Score: {points}/5
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">
                                                            Not answered
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
