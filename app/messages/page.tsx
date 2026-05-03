"use client"

import { useState } from "react"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowRight, ImageIcon, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data
const conversations = [
  {
    id: "c1",
    user: {
      name: "نورة الصباح",
      avatar: "/images/avatar-1.jpg",
    },
    listing: {
      id: "1",
      title: "فستان سهرة ذهبي",
      image: "/images/listing-1.jpg",
    },
    lastMessage: "شكراً، متى يمكنني استلام القطعة؟",
    time: "منذ 5 دقائق",
    unread: true,
  },
  {
    id: "c2",
    user: {
      name: "سارة العلي",
      avatar: "/images/avatar-2.jpg",
    },
    listing: {
      id: "3",
      title: "عباية مطرزة فاخرة",
      image: "/images/listing-3.jpg",
    },
    lastMessage: "هل القطعة متاحة يوم الجمعة؟",
    time: "منذ ساعة",
    unread: true,
  },
  {
    id: "c3",
    user: {
      name: "منى الراشد",
      avatar: "/images/avatar-3.jpg",
    },
    listing: {
      id: "1",
      title: "فستان سهرة ذهبي",
      image: "/images/listing-1.jpg",
    },
    lastMessage: "تم الحجز، شكراً لك",
    time: "أمس",
    unread: false,
  },
  {
    id: "c4",
    user: {
      name: "هند المطيري",
      avatar: "/images/avatar-4.jpg",
    },
    listing: {
      id: "2",
      title: "حقيبة شانيل كلاسيك",
      image: "/images/listing-2.jpg",
    },
    lastMessage: "هل يمكن التفاوض على السعر؟",
    time: "منذ 3 أيام",
    unread: false,
  },
]

const messages = [
  {
    id: "m1",
    sender: "other",
    text: "مرحباً، أنا مهتمة بفستان السهرة الذهبي",
    time: "10:30 ص",
  },
  {
    id: "m2",
    sender: "me",
    text: "أهلاً نورة! الفستان متاح للإيجار. هل تريدين معرفة المزيد من التفاصيل؟",
    time: "10:32 ص",
  },
  {
    id: "m3",
    sender: "other",
    text: "نعم، هل يناسب مقاسي M؟",
    time: "10:35 ص",
  },
  {
    id: "m4",
    sender: "me",
    text: "نعم بالضبط، الفستان مقاس M ويناسب 38-40. وبإمكانك تجربته قبل الإيجار إذا أردتِ.",
    time: "10:38 ص",
  },
  {
    id: "m5",
    sender: "other",
    text: "رائع! أريد حجزه من 15 إلى 18 مارس",
    time: "10:40 ص",
  },
  {
    id: "m6",
    sender: "me",
    text: "ممتاز! هذه التواريخ متاحة. المجموع سيكون 255 د.ك (85 د.ك × 3 أيام). هل أؤكد الحجز؟",
    time: "10:42 ص",
  },
  {
    id: "m7",
    sender: "other",
    text: "نعم، أكدي الحجز من فضلك",
    time: "10:45 ص",
  },
  {
    id: "m8",
    sender: "me",
    text: "تم تأكيد الحجز! سأرسل لك تفاصيل التسليم قريباً.",
    time: "10:47 ص",
  },
  {
    id: "m9",
    sender: "other",
    text: "شكراً، متى يمكنني استلام القطعة؟",
    time: "10:50 ص",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [showConversations, setShowConversations] = useState(true)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // Handle sending message
    setNewMessage("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="h-[calc(100vh-200px)] min-h-[500px] border rounded-xl overflow-hidden flex">
            {/* Conversations List */}
            <div
              className={cn(
                "w-full md:w-80 lg:w-96 border-l bg-card flex flex-col",
                !showConversations && "hidden md:flex"
              )}
            >
              {/* Header */}
              <div className="p-4 border-b">
                <h1 className="text-xl font-bold">الرسائل</h1>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation)
                        setShowConversations(false)
                      }}
                      className={cn(
                        "w-full p-4 text-right hover:bg-muted/50 transition-colors",
                        selectedConversation.id === conversation.id && "bg-muted"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.user.avatar} />
                            <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {conversation.unread && (
                            <span className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{conversation.user.name}</span>
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conversation.listing.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div
              className={cn(
                "flex-1 flex flex-col bg-background",
                showConversations && "hidden md:flex"
              )}
            >
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowConversations(true)}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedConversation.user.avatar} />
                  <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="font-semibold">{selectedConversation.user.name}</h2>
                  <p className="text-xs text-muted-foreground">نشطة الآن</p>
                </div>

                {/* Listing Info */}
                <div className="hidden sm:flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                  <div className="w-10 h-12 rounded overflow-hidden">
                    <Image
                      src={selectedConversation.listing.image}
                      alt={selectedConversation.listing.title}
                      width={40}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedConversation.listing.title}</span>
                </div>

                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "me" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2",
                          message.sender === "me"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="اكتبي رسالتك..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
