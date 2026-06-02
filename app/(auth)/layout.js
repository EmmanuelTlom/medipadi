export const metadata = {
  robots: { index: false, follow: false },
};

const AuthLayout = ({ children }) => {
  return <div className="flex justify-center pt-40">{children}</div>;
};

export default AuthLayout;
