import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
  className?: string;
  cursorClassName?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  typingSpeed = 75,
  deletingSpeed = 40,
  pauseMs = 2200,
  className = '',
  cursorClassName = 'text-amber-400',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;

    if (!isDeleting) {
      if (displayedText.length < text.length) {
        timer = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseMs);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 400);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, text, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={`inline-flex items-center font-mono ${className}`}>
      <span>{displayedText}</span>
      <span className={`inline-block w-1.5 h-3.5 ms-1 bg-amber-400 animate-pulse rounded-xs ${cursorClassName}`} />
    </span>
  );
};

export default TypewriterText;
