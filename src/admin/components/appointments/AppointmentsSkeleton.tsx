import { Skeleton } from '@/components/ui'

const ROWS = 6

/** Loading placeholder matching the table (md+) and stacked cards (<md). */
export function AppointmentsSkeleton() {
  return (
    <>
      <div className="card hidden overflow-hidden md:block" aria-busy aria-label="Loading appointments">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Service</th>
                <th scope="col">Date &amp; time</th>
                <th scope="col">Phone</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </td>
                  <td>
                    <Skeleton className="h-3.5 w-28" />
                  </td>
                  <td>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-20 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden" aria-busy aria-label="Loading appointments">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-44" />
                <Skeleton className="mt-2 h-3.5 w-40" />
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-ink-100 pt-3">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
