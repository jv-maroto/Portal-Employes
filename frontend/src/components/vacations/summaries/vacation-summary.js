export default function VacationSummary({ vacationData }) {
    if (!vacationData) {
      return (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-3 text-esmerald-800">Vacaciones</h3>
          <p className="text-sm text-gray-500">No hay datos disponibles</p>
        </div>
      );
    }
  
    const { total, taken, remaining } = vacationData;
  
    const progressPercentage = (taken / total) * 100;
  
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3 text-emerald-800">Vacaciones</h3>
        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap justify-between text-sm mb-1 gap-2">
              <span>Total: {total} días</span>
              <span>{taken} usados</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
  
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Restantes:</span>
              <span>{remaining} días</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  