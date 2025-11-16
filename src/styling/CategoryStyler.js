// Placeholder for category-based styling logic.
// Responsible for mapping AV categories and statuses to cssClass/cssStyle.

export class CategoryStyler {
  constructor() {
    this.categoryColors = {
      Audio: '#4A90E2',
      Video: '#E24A6F',
      Network: '#50C878',
      Control: '#F5A623',
      Power: '#D0021B',
      Default: '#999999',
    };
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getNodeStyle(category, status) {
    throw new Error('CategoryStyler.getNodeStyle is not implemented yet.');
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getEdgeStyle(category) {
    throw new Error('CategoryStyler.getEdgeStyle is not implemented yet.');
  }
}
