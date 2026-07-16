import {
  getUniversityInitials,
  type CollegeProfile,
} from "@/lib/college-profile";

type CollegeProfileAvatarProps = {
  profile: CollegeProfile;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-16 w-16 text-lg",
  lg: "h-28 w-28 text-xl sm:h-32 sm:w-32",
} as const;

const radiusClasses = {
  sm: "rounded-full",
  md: "rounded-2xl",
  lg: "rounded-3xl",
} as const;

export function CollegeProfileAvatar({
  profile,
  size = "md",
  className = "",
}: CollegeProfileAvatarProps) {
  const initials = getUniversityInitials(profile.universityName);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-amber-500/20 bg-gradient-to-br from-zinc-800 to-zinc-900 font-bold text-amber-400/80 ${sizeClasses[size]} ${radiusClasses[size]} ${className}`}
      aria-label={`${profile.universityName} logo`}
    >
      {profile.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.logoDataUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
