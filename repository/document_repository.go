package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

type documentRepository struct {
	ctx            context.Context
	docsCollection *mongo.Collection
}

func NewDocumentRepository(ctx context.Context, docsCollection *mongo.Collection) DocumentRepository {
	return &documentRepository{
		ctx:            ctx,
		docsCollection: docsCollection,
	}
}
func (r *documentRepository) List(filter Filter) ([]*DocumentImpl, int64, error) {
	if filter.Limit <= 0 {
		filter.Limit = 10
	}
	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Sort == "" || filter.Sort == "asc" {
		filter.Sort = "asc"
	}
	limit := int64(filter.Limit)
	skip := (int64(filter.Page) - 1) * limit

	// Handler sorting
	sortDocument := 1
	if filter.Sort == "desc" {
		sortDocument = -1
	}
	sort := bson.D{{"title", sortDocument}, {"year", sortDocument}, {"updatedDate", sortDocument}}
	// Query filter
	query := bson.D{}
	if filter.Keyword != "" {
		keywordFilter := bson.D{{"$regex", filter.Keyword}, {"$options", "i"}}
		query = append(query, bson.E{"$or", bson.A{bson.D{{"title", keywordFilter}}, bson.D{{"subjectCode", keywordFilter}}, bson.D{{"subjectType", keywordFilter}}, bson.D{{"remarks", keywordFilter}}, bson.D{{"subjectTitle", keywordFilter}}, bson.D{{"departmentCode", keywordFilter}}, bson.D{{"sender", keywordFilter}}, bson.D{{"receiver", keywordFilter}}, bson.D{{"receivedBy", keywordFilter}}}})

	}
	if len(filter.Departments) > 0 {
		for _, department := range filter.Departments {
			query = append(query, bson.E{"departmentCode", department})
		}
	}

	opts := options.Find().SetSort(sort).SetLimit(limit).SetSkip(skip)
	curr, err := r.docsCollection.Find(r.ctx, query, opts)
	if err != nil {
		return nil, 0, err
	}
	defer func(curr *mongo.Cursor, ctx context.Context) {
		err := curr.Close(ctx)
		if err != nil {
		}
	}(curr, r.ctx)

	// documents
	documents := []*DocumentImpl{}
	for curr.Next(r.ctx) {
		document := &DocumentImpl{}
		if err := curr.Decode(document); err != nil {
			return nil, 0, err
		}
		documents = append(documents, document)
	}

	documentCount, _ := r.docsCollection.CountDocuments(r.ctx, query)

	if err := curr.Err(); err != nil {
		return nil, 0, err
	}

	return documents, documentCount, nil
}
func (r *documentRepository) FindById(id string) (*DocumentImpl, error) {

	// Check and convert the id
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	res := r.docsCollection.FindOne(r.ctx, bson.M{"_id": objID})
	if res.Err() != nil {
		return nil, res.Err()
	}
	// Decode the document
	result := &DocumentImpl{}
	if err := res.Decode(result); err != nil {
		return nil, err
	}

	return result, nil
}
func (r *documentRepository) Create(document *DocumentImpl) (*DocumentImpl, error) {
	documentImpl := DocumentImpl{}
	findErr := r.docsCollection.FindOne(r.ctx, bson.M{"subjectCode": document.SubjectCode}).Decode(&documentImpl)
	if findErr == nil {
		return nil, errors.New("the document already exists")
	}
	if !errors.Is(findErr, mongo.ErrNoDocuments) {
		return nil, findErr
	}

	insertRes, insertErr := r.docsCollection.InsertOne(r.ctx, document)
	if insertErr != nil {
		var writeExc *mongo.WriteException
		if errors.As(insertErr, &writeExc) && len(writeExc.WriteErrors) > 0 && writeExc.WriteErrors[0].Code == 11000 {
			return nil, errors.New("the document already exists")
		}
		return nil, insertErr
	}

	// Ensure insertedID from insertRes is non-nil
	if insertRes == nil || insertRes.InsertedID == nil {
		return nil, errors.New("failed to retrieve the inserted ID")
	}

	// Binding a result
	result := r.docsCollection.FindOne(r.ctx, bson.M{"_id": insertRes.InsertedID})
	newDocument := &DocumentImpl{}
	decodeErr := result.Decode(newDocument)
	if decodeErr != nil {
		return nil, decodeErr
	}

	return newDocument, nil
}
func (r *documentRepository) Update(document *DocumentImpl) error {

	if document.ID == primitive.NilObjectID {
		return errors.New("the document ID is required")
	}

	existingDocument := DocumentImpl{}
	findErr := r.docsCollection.FindOne(r.ctx, bson.M{"_id": document.ID}).Decode(&existingDocument)
	if findErr != nil {
		if errors.Is(findErr, mongo.ErrNoDocuments) {
			return errors.New("document not found")
		}
		return findErr
	}
	/*
		findErr = r.docsCollection.FindOne(r.ctx, bson.M{"subjectCode": document.SubjectCode}).Decode(&existingDocument)
		if findErr == nil {
			return errors.New("the document already exists, subject code: " + document.SubjectCode)
		}
	*/
	filter := bson.M{"_id": document.ID}
	updateFields := bson.D{
		{"$set", bson.D{
			{"year", document.Year},
			{"regReceipt", document.RegReceipt},
			{"subjectCode", document.SubjectCode},
			{"subjectType", document.SubjectType},
			{"subjectTitle", document.SubjectTitle},
			{"receivedDate", document.ReceivedDate},
			{"sender", document.Sender},
			{"receiver", document.Receiver},
			{"receivedBy", document.ReceivedBy},
			{"status", document.Status},
			{"documentStatus", document.DocumentStatus},
			{"departmentCode", document.DepartmentCode},
			{"acl", document.Acl},
			{"remarks", document.Remarks},
			{"files", document.Files},
			{"updatedDate", time.Now().Unix()},
		}},
	}

	_, updateErr := r.docsCollection.UpdateOne(r.ctx, filter, updateFields)
	if updateErr != nil {
		return updateErr
	}

	return nil
}
func (r *documentRepository) Delete(docId string) error {
	if docId == "" {
		return errors.New("the document ID is required")
	}

	id, err := primitive.ObjectIDFromHex(docId)
	if err != nil {
		return err
	}
	filter := bson.M{"_id": id}
	deleteResult, err := r.docsCollection.DeleteOne(r.ctx, filter)
	if err != nil {
		return err
	}
	if deleteResult.DeletedCount == 0 {
		return errors.New("document not found")
	}
	if deleteResult.DeletedCount > 1 {
		return errors.New("multiple documents deleted")
	}
	if deleteResult.DeletedCount == 1 {
		return nil
	}
	return nil

}
func (r *documentRepository) UpdateStatus(docId string, status string) error {
	if docId == "" {
		return errors.New("the document ID is required")
	}
	if status == "" {
		return errors.New("the status is required")
	}
	id, err := primitive.ObjectIDFromHex(docId)
	if err != nil {
		return err
	}
	doc := DocumentImpl{}
	statusFilter := bson.M{"_id": id}
	findErr := r.docsCollection.FindOne(r.ctx, statusFilter).Decode(&doc)
	if findErr != nil {
		return findErr
	}
	statusUpdate := bson.M{"$set": bson.M{"status": status}}
	updateResult, err := r.docsCollection.UpdateOne(r.ctx, statusFilter, statusUpdate)
	if err != nil {
		return err
	}
	if updateResult.MatchedCount == 0 {
		return errors.New("document not found")
	}
	if updateResult.MatchedCount > 1 {
		return errors.New("multiple documents updated")
	}
	if updateResult.MatchedCount == 1 {
		return nil
	}

	return nil

}
func (r *documentRepository) UpdateFiles(docId string, files []File) error {
	if docId == "" {
		return errors.New("the document ID is required")
	}

	id, err := primitive.ObjectIDFromHex(docId)
	if err != nil {
		return err
	}
	// Query update file
	res, err := r.docsCollection.UpdateOne(r.ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"files": files}})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("document not found")
	}
	if res.MatchedCount > 1 {
		return errors.New("multiple documents updated")
	}
	if res.MatchedCount == 1 {
		return nil
	}
	return nil

}
func (r *documentRepository) FileListByDocId(docId string) ([]*File, error) {
	if docId == "" {
		return nil, errors.New("the document ID is required")
	}
	id, err := primitive.ObjectIDFromHex(docId)
	if err != nil {
		return nil, err
	}
	// Document id
	filter := bson.M{"documentId": id}
	opts := options.FindOneOptions{Projection: bson.M{"_id": 0, "files": 1}}
	var files []*File
	err = r.docsCollection.FindOne(r.ctx, filter, &opts).Decode(&files)
	if err != nil {
		return nil, err
	}
	if len(files) == 0 {
		return nil, errors.New("no files found")
	}
	if len(files) > 0 {
		return files, nil
	}
	return nil, nil
}
