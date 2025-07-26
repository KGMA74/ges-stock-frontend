const ScreenIndicator = () => {
  return (
      <div className="flex items-center justify-center text-red-600 fixed top-0 left-0 z-50 bg-white rounded">
          <p className="sm:hidden">[xs]</p>
          <p className="hidden sm:block md:hidden">[sm]</p>
          <p className="hidden md:block lg:hidden">[md]</p>
          <p className="hidden lg:block xl:hidden">[lg]</p>
          <p className="hidden xl:block 2xl:hidden">[xl]</p>
          <p className="hidden 2xl:block">[2xl]</p>
      </div>
  );
}

export default ScreenIndicator;