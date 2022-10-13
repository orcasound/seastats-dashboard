import { useContext, useState } from "react";
import useApi from "../hooks/useApi";
import LoadingSpinner from "../components/basic/LoadingSpinner";
import ErrorMessage from "../components/basic/ErrorMessage";
import LoadingOverlay from "../components/basic/LoadingOverlay";
import { Settings } from "../context/Settings";

function withChartUploads(
  ChartComponent,
  { chartUploadsFromResponses = () => {} }
) {
  return (chartProps) => {
    const { stationData } = useContext(Settings);
    const [chartUploads, setChartUploads] = useState();
    const uploadTypes = [chartProps.uploadType];
    const requests = uploadTypes.map(
      (type) =>
        `station-uploads/${stationData.organizationKey}/${stationData.stationKey}?uploadType=${type}`
    );
    const onComplete = (responses, errorMsg) => {
      const responsesWithMeta = () =>
        responses.map((response, index) => ({
          ...response,
          data: response.data.map((upload) => {
            const filename = upload.key.split("/").pop();
            const date = filename.split(".")[0];
            const uploadType = uploadTypes[index];
            return {
              ...upload,
              uploadType,
              filename,
              date,
            };
          }),
        }));
      setChartUploads(
        errorMsg ? null : chartUploadsFromResponses(responsesWithMeta())
      );
    };
    const { loadingData, updatingData, errorMsg, responses } = useApi(
      requests,
      onComplete
    );

    if (loadingData) return <LoadingSpinner />;

    if (errorMsg) return <ErrorMessage message={errorMsg} />;

    return (
      <>
        {updatingData && <LoadingOverlay />}
        <ChartComponent
          {...chartProps}
          chartUploads={chartUploads}
          updating={updatingData}
        />
      </>
    );
  };
}

export default withChartUploads;
