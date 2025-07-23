import DashboardCard from "./dashboard-card";

// You can pass tasks as props for a real implementation
const tasks = [
    { id: 1, title: "Practice Present Tense", due: "Due Tomorrow", status: "pending" },
    { id: 2, title: "Chapter 3 Quiz", due: "Due in 3 days", status: "pending" },
    { id: 3, title: "Reading: Ibong Adarna", due: "Overdue", status: "overdue" },
];

const TodoListCard = () => {
    return (
        <DashboardCard className="col-span-2 md:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">To-do List</h3>
              {/* Optional: Add sort buttons here */}
            </div>
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="flex items-center justify-between text-sm hover:bg-white/5 p-2 -m-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-slate-200">{task.title}</p>
                    <p className={`text-xs ${task.status === 'overdue' ? 'text-red-400' : 'text-slate-400'}`}>{task.due}</p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${task.status === 'overdue' ? 'bg-red-500' : 'bg-purple-500'}`} />
                </li>
              ))}
            </ul>
        </DashboardCard>
    );
}

export default TodoListCard;