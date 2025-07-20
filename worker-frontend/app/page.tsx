import { Appbar } from "@/components/AppBar";
import { NextTask } from "@/components/Nexttask";
// import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Appbar />
      <NextTask />
    </div>
  );
}
