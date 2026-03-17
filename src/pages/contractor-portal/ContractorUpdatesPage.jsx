import WorkUpdateForm from "./components/WorkUpdateForm";

const ContractorUpdatesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Update Work</h1>
        <p className="text-sm text-slate-500">
          Submit progress updates, photos, and completion remarks.
        </p>
      </div>
      <WorkUpdateForm />
    </div>
  );
};

export default ContractorUpdatesPage;

