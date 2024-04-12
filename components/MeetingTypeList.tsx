"use client";
import Image from "next/image";
import React, { useState } from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import { Description } from "@radix-ui/react-dialog";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "./ui/use-toast";

type TMeetingState =
  | "isJoiningMeeting"
  | "isInstantMeeting"
  | "isScheduleMeeting";

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<TMeetingState | undefined>();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: "",
    link: "",
  });
  const [callDetails, setCallDetails] = useState<Call>();
  const { toast } = useToast();

  const createMeeting = async () => {
    if (!client || !user) {
      return;
    }
    try {
      if (!values.dateTime) {
        toast({
          title: "Please select a date and time",
        });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) {
        throw new Error("Failed to create call");
      }

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const desctiption = values.description || "Instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            desctiption,
          },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }

      toast({
        title: "Meeting Created",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to create meeting",
      });
    }
  };

  const boxes = [
    {
      img: "/icons/add-meeting.svg",
      title: "New Meeting",
      description: "Start an instant meeting",
      handleClick: () => setMeetingState("isInstantMeeting"),
      className: "bg-orange-1",
    },
    {
      img: "/icons/schedule.svg",
      title: "Schedule Meeting",
      description: "Plan your meeting",
      handleClick: () => setMeetingState("isScheduleMeeting"),
      className: "bg-blue-1",
    },
    {
      img: "/icons/join-meeting.svg",
      title: "Recordings",
      description: "Check your recordings",
      handleClick: () => router.push("/recordings"),
      className: "bg-purple-1",
    },
    {
      img: "/icons/join-meeting.svg",
      title: "Join Meeting",
      description: "via invitation link",
      handleClick: () => setMeetingState("isJoiningMeeting"),
      className: "bg-yellow-1",
    },
  ];
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {boxes.map((box, index) => (
        <HomeCard key={box.title + index} {...box} />
      ))}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an instant Meeting"
        className="text-center"
        buttonText="Start Metting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;
