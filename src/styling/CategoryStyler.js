// src/styling/CategoryStyler.js

// Responsible for mapping AV categories and statuses to cssClass/cssStyle.

export class CategoryStyler {
  constructor() {
    this.categoryColors = {
      Audio: '#1f77b4', // blue
      Video: '#ff7f0e', // orange
      Network: '#2ca02c', // green
      Control: '#d62728', // red
      Power: '#9467bd', // purple
      Default: '#cccccc'
    };

    this.statusStyles = {
      Existing: {opacity: 0.6, borderColor: '#555555'},
      Regular: {opacity: 1.0, borderColor: '#000000'},
      Defect: {opacity: 1.0, borderColor: '#ff0000'},
      Default: {opacity: 1.0, borderColor: '#000000'}
    };
  }

  getNodeStyle(category, status) {
    const baseColor = this.categoryColors[category] || this.categoryColors.Default;
    const statusStyle = this.statusStyles[status] || this.statusStyles.Default;
    return {
      fill: baseColor,
      stroke: statusStyle.borderColor,
      opacity: statusStyle.opacity
    };
  }

  getEdgeStyle(category, status) {
    const baseColor = this.categoryColors[category] || this.categoryColors.Default;
    const statusStyle = this.statusStyles[status] || this.statusStyles.Default;
    return {
      stroke: baseColor,
      strokeWidth: status === 'Defect' ? 3 : 1.5,
      opacity: statusStyle.opacity
    };
  }
}
