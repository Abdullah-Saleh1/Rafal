export const constructionStageLabels = {
  under_construction: 'قيد الإنشاء',
  ready: 'جاهز',
  sold: 'مباع',
}

export const constructionStages = Object.entries(constructionStageLabels).map(([value, label]) => ({ value, label }))
