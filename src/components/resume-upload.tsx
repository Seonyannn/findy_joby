"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ResumeData } from "@/lib/schemas";

type ParseStatus = "idle" | "parsing" | "parsed" | "error";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  parseStatus: ParseStatus;
  resumeData: ResumeData | null;
}

export function ResumeUpload({
  file,
  onFileChange,
  parseStatus,
  resumeData,
}: ResumeUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (
        dropped &&
        (dropped.type === "application/pdf" ||
          dropped.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      ) {
        onFileChange(dropped);
      }
    },
    [onFileChange]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] ?? null;
      onFileChange(selected);
    },
    [onFileChange]
  );

  const statusBadge = {
    idle: null,
    parsing: (
      <Badge variant="secondary" className="animate-pulse">
        解析中...
      </Badge>
    ),
    parsed: <Badge className="bg-green-600 hover:bg-green-700">已解析</Badge>,
    error: <Badge variant="destructive">解析失败</Badge>,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">上传简历</CardTitle>
        {statusBadge[parseStatus]}
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
          onClick={() => document.getElementById("resume-input")?.click()}
        >
          <input
            id="resume-input"
            type="file"
            accept=".pdf,.docx"
            onChange={handleChange}
            className="hidden"
          />
          {file ? (
            <div className="space-y-2">
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              {resumeData && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>
                    {resumeData.name}
                    {resumeData.contact?.location &&
                      ` · ${resumeData.contact.location}`}
                  </p>
                  <p>
                    {resumeData.skills.slice(0, 5).join(" / ")}
                    {resumeData.skills.length > 5 && " ..."}
                  </p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="text-xs text-destructive hover:underline"
              >
                移除文件
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                拖拽或点击上传简历
              </p>
              <p className="text-xs text-muted-foreground">
                支持 PDF、DOCX 格式，最大 10MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
