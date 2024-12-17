// new Approach

class DurationRangeFilter {
    init(params) {
      this.params = params;
      this.filterModel = {
        min: null,
        max: null
      };
      this.createFilterUI();
    }
  
    createFilterUI() {
      this.minInput = document.createElement('input');
      this.minInput.type = 'number';
      this.minInput.placeholder = 'Min Duration';
      this.minInput.addEventListener('input', () => {
        this.filterModel.min = Number(this.minInput.value);
        this.params.filterChangedCallback();
      });
  
      this.maxInput = document.createElement('input');
      this.maxInput.type = 'number';
      this.maxInput.placeholder = 'Max Duration';
      this.maxInput.addEventListener('input', () => {
        this.filterModel.max = Number(this.maxInput.value);
        this.params.filterChangedCallback();
      });
  
      this.params.eGui.appendChild(this.minInput);
      this.params.eGui.appendChild(this.maxInput);
    }
  
    doesFilterPass(params) {
      const { min, max } = this.filterModel;
      const duration = params.data.total_duration;
  
      if (min != null && duration < min) {
        return false;
      }
      if (max != null && duration > max) {
        return false;
      }
  
      return true;
    }
  
    isFilterActive() {
      return this.filterModel.min != null || this.filterModel.max != null;
    }
  
    getModel() {
      return this.filterModel;
    }
  
    setModel(model) {
      this.filterModel = model;
      this.minInput.value = model.min || '';
      this.maxInput.value = model.max || '';
    }
  }

// end

export default DurationRangeFilter;