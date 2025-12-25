// // use-bulk-actions.ts
// import { toast } from '@/components/ui/use-toast';
// import { useDeleteBatchPlanPrice } from '@/queries/plan-price.query';

// export function useBulkActions() {
//   const { mutateAsync: deleteBatchPlanPrice } = useDeleteBatchPlanPrice();

//   const handleApprove = async (rows: any[]) => {
//     console.log('Approve selected events:', rows);
//   };

//   const handleDelete = async (rows: any[]) => {
//     const ids = rows.map((r) => r.planPriceId);
//     try {
//       await deleteBatchPlanPrice(ids);
//       toast({
//         title: 'Thành công',
//         description: 'Xóa gói thành công',
//         variant: 'success'
//       });
//     } catch (err: any) {
//       toast({
//         title: 'Lỗi',
//         description: err?.message ?? 'Xảy ra lỗi khi xóa gói',
//         variant: 'destructive'
//       });
//     }
//   };

//   const bulkAction = [
//     {
//       label: 'Reset giá',
//       className: 'bg-red-500 text-white',
//       onClick: handleDelete,
//       isVisible: (rows: any[]) => rows.every((r) => r.priceVnd !== 0)
//     }
//   ];

//   return { handleApprove, handleDelete, bulkAction };
// }
