/*
  Warnings:

  - A unique constraint covering the columns `[userId,meetingId]` on the table `MeetingAttendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendance_userId_meetingId_key" ON "MeetingAttendance"("userId", "meetingId");
