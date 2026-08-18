'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_COURSES } from '@/lib/mockData';
import { getUser } from '@/lib/auth';
import { getCustomCourses, saveCourse, deleteCourse } from '@/lib/teacherStore';
import type { User, Course } from '@/lib/mockData';
import {
  Plus, X, Broadcast, MagnifyingGlass, Microscope, Trash,
  ChalkboardTeacher, BookOpen, Users, CheckCircle, ArrowRight,
} from '@phosphor-icons/react';
import { CourseIcon } from '@/components/ui/IconHelper';
import { launchAndroidAR } from '@/lib/arLauncher';

const EMOJI_OPTIONS = ['🔬','🧬','❤️','🧠','🌿','🦴','🫁','🧪','⚗️','🌡️','💉','🫀'];
const COLOR_OPTIONS = ['#4ade80','#c084fc','#f87171','#60a5fa','#fbbf24','#34d399','#fb923c','#e879f9'];

function AddCourseModal({ teacher, onClose, onAdd }: {
  teacher: User;
  onClose: () => void;
  onAdd: (c: Course) => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [emoji, setEmoji] = useState('🔬');
  const [color, setColor] = useState('#4ade80');
  const [duration, setDuration] = useState('30 min');
  const [hasAR, setHasAR] = useState(false);
  const [lessons, setLessons] = useState('4');

  function handleSave() {
    if (!title.trim()) return;
    const course: Course = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      subject: 'Biology',
      description: desc.trim() || 'A new course added by your teacher.',
      teacher: teacher.name,
      teacherId: teacher.id,
      emoji,
      color,
      duration,
      totalLessons: parseInt(lessons) || 4,
      completedLessons: 0,
      hasARModel: hasAR,
      modelRoute: hasAR ? '/cell' : undefined,
      tags: ['Biology', teacher.grade],
      dateAdded: new Date().toISOString().split('T')[0],
      enrolled: 0,
    };
    saveCourse(course);
    onAdd(course);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end p-4 animate-fade-in"
      onClick={onClose}>
      <div className="kid-card w-full p-6 animate-slide-up max-h-[85dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Plus weight="bold" size={22} color="#ce82ff" />
            <h2 className="text-xl font-black text-white">New Course</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors">
            <X weight="bold" size={20} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Emoji picker */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button key={e} type="button"
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: emoji === e ? `${color}30` : 'rgba(255,255,255,0.06)', border: `2px solid ${emoji === e ? color : 'transparent'}` }}>
                  <CourseIcon emoji={e} size={22} color={color} />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full transition-all"
                  style={{ background: c, border: `3px solid ${color === c ? '#fff' : 'transparent'}`,
                           transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Course Title *</label>
            <input id="new-course-title" className="kid-input" placeholder="e.g. The Human Skeletal System 🦴"
              value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Description</label>
            <textarea id="new-course-desc" className="kid-input resize-none" rows={3}
              placeholder="What will students learn in this course?"
              value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>

          {/* Duration + Lessons row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Duration</label>
              <input id="new-course-duration" className="kid-input" placeholder="e.g. 30 min"
                value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">No. of Lessons</label>
              <input id="new-course-lessons" className="kid-input" type="number" min="1" max="20"
                value={lessons} onChange={(e) => setLessons(e.target.value)} />
            </div>
          </div>

          {/* AR toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: hasAR ? '#4ade8012' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${hasAR ? '#4ade8040' : 'rgba(255,255,255,0.08)'}` }}>
            <div className="flex items-center gap-2 mb-0.5">
              <Broadcast weight="fill" size={18} color="#58cc02" />
              <p className="font-black text-white text-sm">Includes AR Model</p>
            </div>
            <p className="text-white/40 text-xs">Students can view in Augmented Reality</p>
            <button id="new-course-ar-toggle" type="button"
              onClick={() => setHasAR((v) => !v)}
              className="w-12 h-7 rounded-full transition-all flex items-center px-1"
              style={{ background: hasAR ? '#4ade80' : 'rgba(255,255,255,0.15)', justifyContent: hasAR ? 'flex-end' : 'flex-start' }}>
              <div className="w-5 h-5 rounded-full bg-white shadow" />
            </button>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-2xl" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
            <p className="text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}25` }}>
                <CourseIcon emoji={emoji} size={24} color={color} />
              </div>
              <div>
                <p className="font-black text-white text-sm">{title || 'Course Title'}</p>
                <p className="text-white/40 text-xs">{teacher.name} · {duration}</p>
              </div>
              {hasAR && (
                <span className="pill ml-auto flex items-center gap-1" style={{ background: `${color}20`, color }}>
                  <Broadcast weight="fill" size={12} />AR
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button type="button" className="kid-btn kid-btn--ghost flex-1" onClick={onClose}>Cancel</button>
            <button id="new-course-save" type="button" className="kid-btn flex-1 flex items-center justify-center gap-2"
              disabled={!title.trim()}
              style={{ background: color, color: '#fff', boxShadow: `0 4px 0 ${color}88`, opacity: title.trim() ? 1 : 0.4 }}
              onClick={handleSave}>
              <CheckCircle weight="fill" size={18} />
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customCourses, setCustomCourses] = useState<Course[]>([]);

  useEffect(() => {
    setUser(getUser());
    setCustomCourses(getCustomCourses());
  }, []);

  const isTeacher = user?.role === 'teacher';
  const allCourses = [...MOCK_COURSES, ...customCourses];
  const filtered = allCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase()),
  );

  function handleDelete(id: string) {
    deleteCourse(id);
    setCustomCourses(getCustomCourses());
  }

  if (!user) return null;

  return (
    <div className="px-5 pt-8 pb-4 animate-fade-in" style={{ fontFamily: 'var(--font-nunito)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/50 text-sm font-semibold">{isTeacher ? 'Manage Courses' : 'Your Courses'}</p>
          <div className="flex items-center gap-2">
            <BookOpen weight="fill" size={26} color="#58cc02" />
            <h1 className="text-2xl font-black text-white">Library</h1>
          </div>
        </div>
        {isTeacher && (
          <button id="courses-add-btn" onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-sm"
            style={{ background: '#ce82ff22', color: '#ce82ff', border: '1.5px solid #ce82ff44' }}>
            <Plus weight="bold" size={16} />
            Add
          </button>
        )}
      </div>

      {/* Role banner */}
      {isTeacher && (
        <div className="mb-5 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: '#c084fc12', border: '1px solid #c084fc30' }}>
          <ChalkboardTeacher weight="fill" size={22} color="#ce82ff" />
          <p className="text-xs font-bold text-[#ce82ff]">
            Teacher Mode — add, edit and remove courses. Students see these as read-only.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <MagnifyingGlass weight="bold" size={18} color="rgba(255,255,255,0.3)" />
        </span>
        <input id="courses-search" type="text" className="kid-input" style={{ paddingLeft: '44px' }}
          placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Courses */}
      <div className="flex flex-col gap-4">
        {filtered.map((course, i) => {
          const pct = Math.round((course.completedLessons / course.totalLessons) * 100);
          const isOwned = isTeacher && (course.teacherId === user?.id || customCourses.find((c) => c.id === course.id));
          return (
            <div key={course.id} id={`course-${course.id}`}
              className="kid-card p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner"
                  style={{ background: `${course.color}20` }}>
                  <CourseIcon emoji={course.emoji} size={30} color={course.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-black text-white text-base leading-tight">{course.title}</h3>
                    {course.hasARModel && (
                      <span className="pill flex-shrink-0 flex items-center gap-1" style={{ background: '#58cc0220', color: '#58cc02' }}>
                        <Broadcast weight="fill" size={12} />AR
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-semibold mb-1">{course.teacher} · {course.duration}</p>
                  <p className="text-white/60 text-sm font-semibold leading-snug mb-3 line-clamp-2">{course.description}</p>

                  <div className="flex gap-2 flex-wrap mb-3">
                    {course.tags.map((tag) => (
                      <span key={tag} className="pill" style={{ background: `${course.color}15`, color: `${course.color}cc` }}>{tag}</span>
                    ))}
                  </div>

                  {/* Progress bar — student sees their progress; teacher sees enrolled count */}
                  {isTeacher ? (
                    <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                      <span className="flex items-center gap-1">
                        <BookOpen weight="fill" size={13} />{course.totalLessons} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users weight="fill" size={13} />{course.enrolled} enrolled
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="progress-bar flex-1">
                        <div className="progress-bar__fill"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${course.color}, ${course.color}88)` }} />
                      </div>
                      <span className="text-xs font-black whitespace-nowrap" style={{ color: course.color }}>
                        {course.completedLessons}/{course.totalLessons}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                {course.hasARModel && (
                  <>
                    <Link href="/cell" id={`course-${course.id}-view`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs"
                      style={{ background: `${course.color}18`, color: course.color, border: `1px solid ${course.color}30` }}>
                      <Microscope weight="fill" size={15} />
                      3D Viewer
                    </Link>
                    <button
                      id={`course-${course.id}-ar`}
                      onClick={(e) => {
                        e.stopPropagation();
                        launchAndroidAR('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Cell/glTF-Binary/Cell.glb', course.title);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs"
                      style={{ background: '#58cc0222', color: '#58cc02', border: '1px solid #58cc0250' }}>
                      <Broadcast weight="fill" size={15} />
                      Camera AR
                    </button>
                  </>
                )}
                {isTeacher && customCourses.find((c) => c.id === course.id) && (
                  <button id={`course-${course.id}-delete`}
                    onClick={() => handleDelete(course.id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-sm"
                    style={{ background: '#ff4b4b15', color: '#ff4b4b', border: '1px solid #ff4b4b30' }}>
                    <Trash weight="fill" size={15} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {showAddModal && user && (
        <AddCourseModal
          teacher={user}
          onClose={() => setShowAddModal(false)}
          onAdd={(c) => setCustomCourses((prev) => [...prev, c])}
        />
      )}
    </div>
  );
}
