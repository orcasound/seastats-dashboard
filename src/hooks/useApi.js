import { useEffect, useState } from "react";
import { apiUrl } from "../utils/helpers";

function useApi(requests = [], onComplete = () => {}, effectDeps = []) {
  const [responses, setResponses] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingData, setUpdatingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loadingData) setUpdatingData(true);
    // ToDo: Browser caching should make repeat fetches of the same URL here very fast, once cache directives are set up on the API
    // Temporary rudimentary password protection
    const appPwd = sessionStorage.getItem("appPwd");

    const dataFetch = async () => {
      let errorMsg = "";
      let responses = [];
      try {
        responses = await Promise.all(
          requests.map((request) =>
            fetch(`${apiUrl}${request}`, {
              headers: {
                ...(appPwd ? { authorization: `Bearer ${appPwd}` } : {}),
              },
            }).then((response) => response.json())
          )
        );
        const responseErrors = responses
          .filter((response) => !response.success)
          .map((response) => response.msg);
        errorMsg = responseErrors.length > 0 ? responseErrors[0] : "";
      } catch (error) {
        errorMsg = error.message;
      }

      setLoadingData(false);
      setUpdatingData(false);
      setErrorMsg(errorMsg);
      setResponses(responses);
      onComplete(responses, errorMsg);
    };

    dataFetch();
  }, effectDeps);

  return { loadingData, updatingData, errorMsg, responses };
}

export default useApi;
