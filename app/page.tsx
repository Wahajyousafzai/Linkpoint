"use client";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShineBorder from "@/components/ui/shine-border";
import { socket } from "@/lib/socketClient";
import { useEffect, useRef, useState } from "react";


export default function Home () {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; message: string; }[]>([]);
  const [userName, setUserName] = useState("");
  const [bgImage, setBgImage] = useState("bg-bgImg1");

  const backgrounds = ["bg-bgImg1", "bg-bgImg2", "bg-bgImg3", "bg-bgImg4", "bg-bgImg5"];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user-joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    return () => {
      socket.off("user-joined");
      socket.off("message");
    };
  }, []);

  const handleJoinRoom = () => {
    if (room && userName) {
      socket.emit("join-room", { room, username: userName });
      setJoined(true);
    }
  };
  const handleSendMessage = (message: string) => {
    const data = { room, message, sender: userName };
    setMessages((prev) => [...prev, { sender: userName, message }]);
    socket.emit("message", data);
  };

  const change = () => {
    setBgImage(prev => {
      const currentIndex = backgrounds.indexOf(prev);
      const nextIndex = (currentIndex + 1) % backgrounds.length;
      return backgrounds[nextIndex];
    });
  };
  const MyArray: string[] = ["hi🎉", "how are you", "i am fine", "whatsup", "i love to hear", "wahaj", "Ahmed"];

  return (
    <div className="flex mt-2 w-full justify-center">
      { !joined ? (
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="mb-4 text-2xl font-bold">Join Room</h1>
          <input
            type="text"
            placeholder="Enter you user name"
            value={ userName }
            onChange={ (e) => setUserName(e.target.value) }
            className="w-64 px-2 border-2 py-2 mb-4 rounded-lg"
          />
          <input
            type="text"
            placeholder="Enter room name"
            value={ room }
            onChange={ (e) => setRoom(e.target.value) }
            className="w-64 px-2 border-2 py-2 mb-4 rounded-lg"
          />

          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={ handleJoinRoom }>
            Join Room
          </button>

        </div>
      ) : (

        <ShineBorder borderWidth={ 300 } className="relative flex rounded-3xl min-h-[85vh] h-full w-full max-w-7xl p-2 m-0 flex-col overflow-hidden justify-center items-center" color={ ["#B07CFE", "#FE8FB5", "#FFBE7B"] }>

          <div className="flex w-full justify-center gap-3 items-center">
            <h1 className={ `text-2xl z-50 font-bold` }>Room: { room }</h1>
            <button onClick={ change } className="p-[3px] relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-1 py-1 bg-black rounded-[5px] relative group duration-200 text-white hover:bg-transparent">
                Change Background
              </div>
            </button>
          </div>

          <ScrollArea className={ `min-h-[80vh] p-2 w-full md:w-full overflow-y-auto rounded-lg ${bgImage} bg-no-repeat bg-cover bg-fixed` }>
            { messages.map((msg, index) => (
              <ChatMessage key={ index }
                sender={ msg.sender }
                message={ msg.message }
                isOwnMessage={ msg.sender === userName }
              />
            )) }
            <div ref={ scrollRef } />
          </ScrollArea>

          <div className="p-1"></div>
          <ChatForm placeholders={ MyArray } onChange={ () => { } } onSubmit={ () => { } } onSendMessage={ handleSendMessage } />
          <div className="p-1"></div>
        </ShineBorder>

      ) }

    </div>
  );
}

