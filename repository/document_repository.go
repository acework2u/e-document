package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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
func (r *documentRepository) Create(document *DocumentImpl) error {

	documentImpl := DocumentImpl{}
	err := r.docsCollection.FindOne(r.ctx, bson.M{"subjectCode": document.SubjectCode}).Decode(&documentImpl)
	if err == nil {
		return errors.New("document already exists")
	}
	if !errors.Is(err, mongo.ErrNoDocuments) {
		return err
	}
	_, err = r.docsCollection.InsertOne(r.ctx, document)
	if err != nil {
		var e *mongo.WriteException
		if errors.As(err, &e) && e.WriteErrors[0].Code == 11000 {
			return errors.New("the document already exists")
		}
	}

	return nil
}
func (r *documentRepository) Update(document *DocumentImpl) error {
	return nil
}
func (r *documentRepository) Delete(docId string) error {
	return nil
}
func (r *documentRepository) UpdateStatus(docId string, status string) error {
	return nil
}
