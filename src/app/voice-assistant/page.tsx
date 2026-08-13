"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              setTranscript(event.results[i][0].transcript); // Update interim
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
            handleSendToAI(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setTranscript(""); // Clear "Listening..." status on error
          
          if (event.error === "not-allowed") {
            setError("Microphone access denied. Please allow microphone in your browser settings.");
          } else if (event.error === "no-speech") {
            setError("No speech detected. Please try speaking a bit louder.");
          } else if (event.error === "network") {
            setError("Network connection failed. Speech recognition requires internet.");
          } else if (event.error === "audio-capture") {
            setError("Microphone not found. Please connect a microphone.");
          } else if (event.error !== "aborted") {
            setError(`Could not hear you clearly (${event.error}). Please try again.`);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setError("Your browser does not support Voice Recognition. Please use Chrome, Edge, or Safari.");
      }
    }
  }, []);

  const toggleListening = async () => {
    setError(null);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      // Explicitly request microphone access first (fixes permission issues on some browsers/mobile)
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch (err) {
        console.error("Microphone permission error:", err);
        setError("Microphone access denied. Please allow microphone in your browser settings.");
        return;
      }

      setTranscript("Listening...");
      setAiResponse("");
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      setIsSpeaking(false);
      
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setError("Could not start microphone. Please try again.");
      }
    }
  };

  const handleSendToAI = async (text: string) => {
    setIsListening(false);
    setIsProcessing(true);
    setAiResponse("");

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (data.success) {
        setAiResponse(data.reply);
        speakResponse(data.reply);
      } else {
        setError("AI could not process the request.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google")));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      
      {/* Dynamic Background Glow Based on State */}
      <div className={`absolute inset-0 transition-opacity duration-1000 blur-3xl opacity-20 pointer-events-none ${
        isListening ? 'bg-red-500/40' : 
        isProcessing ? 'bg-blue-500/40' : 
        isSpeaking ? 'bg-gold/40' : 'bg-transparent'
      }`} />

      <div className="z-10 w-full max-w-2xl text-center space-y-12">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-gold font-bold uppercase tracking-widest text-xs mx-auto w-max px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5">
            <Sparkles size={14} /> Real-Time Voice AI
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Speak Your Heart
          </h1>
          <p className="text-muted text-sm md:text-base px-4">
            Don't type. Just talk naturally. The AI will listen and speak back to you with guidance from Imam Ali (AS).
          </p>
        </div>

        {/* Central Voice Orb UI */}
        <div className="relative flex items-center justify-center py-10">
          {/* Pulsing rings when active */}
          {(isListening || isSpeaking || isProcessing) && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full ${
                  isListening ? 'bg-red-500/30' : isSpeaking ? 'bg-gold/30' : 'bg-blue-500/30'
                }`}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                className={`absolute w-32 h-32 rounded-full ${
                  isListening ? 'bg-red-500/20' : isSpeaking ? 'bg-gold/20' : 'bg-blue-500/20'
                }`}
              />
            </>
          )}

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative z-10 flex h-28 w-28 md:h-32 md:w-32 items-center justify-center rounded-full border-4 shadow-2xl transition-all duration-300 ${
              isListening 
                ? 'border-red-500 bg-red-500/10 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]' 
                : isSpeaking 
                ? 'border-gold bg-gold/10 text-gold shadow-[0_0_40px_rgba(199,166,84,0.4)]'
                : isProcessing
                ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.4)]'
                : 'border-border/40 bg-surface-alt/80 text-foreground hover:border-gold/40 hover:text-gold'
            }`}
          >
            {isListening ? (
              <Square size={40} fill="currentColor" />
            ) : isProcessing ? (
              <Loader2 size={40} className="animate-spin" />
            ) : isSpeaking ? (
              <Volume2 size={40} className="animate-pulse" />
            ) : (
              <Mic size={40} />
            )}
          </button>
        </div>

        {/* Status Text Area */}
        <div className="min-h-[100px] flex flex-col items-center justify-center space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/30">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <p className="text-xl md:text-2xl font-medium text-foreground/90 italic max-w-xl mx-auto leading-relaxed transition-all">
            {transcript || (isListening ? "I'm listening..." : "Tap the microphone to speak")}
          </p>
          
          {aiResponse && !isListening && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 rounded-3xl border border-gold/30 bg-gold/5 max-w-xl mx-auto shadow-lg"
            >
              <p className="text-base text-foreground leading-relaxed">
                "{aiResponse}"
              </p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
