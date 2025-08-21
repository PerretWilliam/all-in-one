import { useState } from "react";
import {
  ImageIcon,
  Music2Icon,
  ClapperboardIcon,
  YoutubeIcon,
  FileTextIcon,
} from "lucide-react";

import { ImageConverter } from "@/components/image/ImageConverter";
import AudioConverter from "@/components/audio/AudioConverter";
import VideoConverter from "@/components/video/VideoConverter";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import YtToAudioConverter from "./components/youtube/YtToAudioConverter.tsx";
import YtToVideoConverter from "./components/youtube/YtToVideoConverter.tsx";
import { Sidebar } from "@/components/layout/Sidebar.tsx";
import { Header } from "@/components/layout/Header.tsx";
import { Footer } from "./components/layout/Footer.tsx";
import Privacy from "./components/pages/Privacy.tsx";
import Terms from "./components/pages/Terms.tsx";
import DocConverter from "./components/docs/DocConverter.tsx";

export default function App() {
  const [selected, setSelected] = useState("image");

  const converters = [
    {
      key: "image",
      label: "Image",
      icon: <ImageIcon className="h-4 w-4 mr-2" />,
      component: <ImageConverter />,
    },
    {
      key: "audio",
      label: "Audio",
      icon: <Music2Icon className="h-4 w-4 mr-2" />,
      component: <AudioConverter />,
    },
    {
      key: "video",
      label: "Vidéo",
      icon: <ClapperboardIcon className="h-4 w-4 mr-2" />,
      component: <VideoConverter />,
    },
    {
      key: "ytdlAudio",
      label: "YouTube → Audio",
      icon: <YoutubeIcon className="h-4 w-4 mr-2" />,
      component: <YtToAudioConverter />,
    },
    {
      key: "ytdlVideo",
      label: "YouTube → Vidéo",
      icon: <YoutubeIcon className="h-4 w-4 mr-2" />,
      component: <YtToVideoConverter />,
    },
    {
      key: "docs",
      label: "Documents",
      icon: <FileTextIcon className="h-4 w-4 mr-2" />,
      component: <DocConverter />,
    },
    // hidden pages, will not appear in the sidebar but can be shown via Footer
    {
      key: "privacy",
      label: "Privacy",
      icon: <></>,
      component: <Privacy />,
    },
    {
      key: "terms",
      label: "Terms",
      icon: <></>,
      component: <Terms />,
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
        <Header />
        <main className="flex flex-1 max-w-7xl mx-auto w-full">
          <Sidebar
            selected={selected}
            setSelected={setSelected}
            converters={converters}
          />
          <section className="flex-1 px-8 py-10">
            {converters.find((c) => c.key === selected)?.component}
          </section>
        </main>
        <Footer onNavigate={setSelected} />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
