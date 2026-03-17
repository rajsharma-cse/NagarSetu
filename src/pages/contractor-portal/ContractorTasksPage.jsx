import TasksTable from "./components/TasksTable";

const ContractorTasksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assigned Tasks</h1>
        <p className="text-sm text-slate-500">
          Review active and upcoming work orders assigned to your firm.
        </p>
      </div>
      <TasksTable />
    </div>
  );
};

export default ContractorTasksPage;

