interface AlertProps {
  type: "error" | "success" | "info";
  message: string;
}

export const Alert = ({ type, message }: AlertProps) => {
  const colors = {
    error: "bg-red-100 text-red-700 border-red-300",
    success: "bg-green-100 text-green-700 border-green-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <div className={`p-4 border rounded-md mb-4 ${colors[type]}`}>
      {message}
    </div>
  );
};
