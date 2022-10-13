import ErrorMessage from "./basic/ErrorMessage";

function ErrorFallback({ error }) {
  return <ErrorMessage message={error.message} />;
}
export default ErrorFallback;
