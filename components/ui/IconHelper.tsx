'use client';

import React from 'react';
import {
  Microscope,
  Heart,
  Dna,
  Plant,
  Brain,
  Bone,
  Wind,
  TestTube,
  Flask,
  Thermometer,
  Syringe,
  Pulse,
  BookOpen,
  Atom,
  Lightning,
  Waves,
  Package,
  Broadcast,
  Drop,
  Exam,
  CircleDashed,
  Student,
  ChalkboardTeacher,
  UserCircle,
  Icon,
} from '@phosphor-icons/react';

// ─── Course Icon Mapping ──────────────────────────────────────────────────────
const COURSE_ICON_MAP: Record<string, Icon> = {
  '🔬': Microscope,
  '❤️': Heart,
  '🧬': Dna,
  '🌿': Plant,
  '🧠': Brain,
  '🦴': Bone,
  '🫁': Wind,
  '🧪': TestTube,
  '⚗️': Flask,
  '🌡️': Thermometer,
  '💉': Syringe,
  '🫀': Pulse,
};

export function CourseIcon({
  emoji,
  size = 28,
  color,
}: {
  emoji: string;
  size?: number;
  color?: string;
}) {
  const IconComp = COURSE_ICON_MAP[emoji] || BookOpen;
  return <IconComp weight="fill" size={size} color={color} />;
}

// ─── Lesson Path Icon Mapping ────────────────────────────────────────────────
const LESSON_ICON_MAP: Record<string, Icon> = {
  l1: CircleDashed, // Cell Membrane
  l2: Atom,         // Nucleus
  l3: Lightning,    // Mitochondria
  l4: Waves,        // Endoplasmic Reticulum
  l5: Package,      // Golgi Body
  l6: Broadcast,    // AR Lab
  l7: Drop,         // Lysosomes
  l8: Exam,         // Final Quiz
};

export function LessonIcon({
  id,
  emoji,
  size = 32,
  color = '#fff',
}: {
  id: string;
  emoji: string;
  size?: number;
  color?: string;
}) {
  const IconComp = LESSON_ICON_MAP[id] || COURSE_ICON_MAP[emoji] || Atom;
  return <IconComp weight="fill" size={size} color={color} />;
}

// ─── User Avatar Icon Mapping ────────────────────────────────────────────────
export function AvatarIcon({
  role,
  size = 24,
  color = '#fff',
}: {
  role?: 'student' | 'teacher' | string;
  avatar?: string;
  size?: number;
  color?: string;
}) {
  if (role === 'teacher') {
    return <ChalkboardTeacher weight="fill" size={size} color={color} />;
  }
  if (role === 'student') {
    return <Student weight="fill" size={size} color={color} />;
  }
  return <UserCircle weight="fill" size={size} color={color} />;
}
