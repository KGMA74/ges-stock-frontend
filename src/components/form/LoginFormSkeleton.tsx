

const LoginFormSkeleton = () => {
  return (
    <div    className="flex flex-col bg-white rounded-t-[35px] sm:rounded-[35px] pt-[48px] pb-[70px] px-[32px] min-h-[485px] w-full sm:w-[461px] gap-[32px] tracking-normal sm:leading-[100%] shadow-2xl">
      {/* Header section skeleton */}
      <div className="flex flex-col gap-[16px]">
        <div className="h-[28px] bg-gray-200 rounded-md animate-pulse w-3/4"></div>
        <div className="space-y-2">
          <div className="h-[26px] bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-[26px] bg-gray-200 rounded animate-pulse w-4/5"></div>
        </div>
      </div>

      {/* Email/Phone field skeleton */}
      <div className="flex flex-col gap-[8px]">
        <div className="h-[14px] bg-gray-200 rounded animate-pulse w-1/3 ml-[6px]"></div>
        <div className="w-full border-1 border-gray-200 rounded-[20px] py-[20px] px-[16px] h-[40px] bg-gray-100 animate-pulse"></div>
      </div>

      {/* Password field skeleton */}
      <div className="flex flex-col gap-[8px]">
        <div className="h-[14px] bg-gray-200 rounded animate-pulse w-1/4 ml-[6px]"></div>
        
        <div className="relative">
          {/* Eye icon skeleton */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-[20px] h-[20px] bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Password input skeleton */}
          <div className="w-full border-1 border-gray-200 rounded-[20px] py-[20px] pl-[16px] pr-[40px] h-[40px] bg-gray-100 animate-pulse"></div>
        </div>
      </div>

      {/* Forgot password link skeleton */}
      <div className="text-right">
        <div className="h-[16px] bg-gray-200 rounded animate-pulse w-1/3 ml-auto"></div>
      </div>

      {/* Submit button skeleton */}
      <div className="flex items-center justify-center gap-2 bg-gray-200 rounded-[20px] h-[40px] animate-pulse">
        <div className="h-[20px] bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default LoginFormSkeleton;