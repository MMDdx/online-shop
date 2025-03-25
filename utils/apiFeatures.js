
class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    filter(){
        const queryObj = {...this.queryStr}
        const excludedFields = ['page', 'sort', 'fields']
        excludedFields.forEach(excludedField => delete queryObj[excludedField])
        // advanced filtering...
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match=>`$${match}`)

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }
    sort(){
        if(this.queryStr.sort){
            let sortBy = this.queryStr.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy)
        }
        return this
    }
    limitFields(){
        if (this.queryStr.fields){
            let fields = this.queryStr.fields.split(",").join(" ");
            this.query = this.query.select(fields)
        }else {
            let fields = this.query.select("-__v")
        }
        return this
    }
}

module.exports = ApiFeatures;