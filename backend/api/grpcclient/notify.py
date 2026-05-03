import sys 
import grpc 
sys.path.append('protos')

from protos.Notification_pb2 import NotificationGrpcRequest, Usergrpc
from protos.Notification_pb2_grpc import NotificationGrpcServiceStub

from google.protobuf.timestamp_pb2 import Timestamp 

def send_notification_gRPC(Notify):
    try:
        import os 
        grpc_host = os.getenv("GRPC_NOTIFY_HOST", "localhost")
        channel = grpc.insecure_channel(f'{grpc_host}:8090')
        stub = NotificationGrpcServiceStub(channel)

        created_at_timestamp = Timestamp()
        created_at_timestamp.FromDatetime(Notify.createdAt)

        request = NotificationGrpcRequest(
            _id=str(Notify.id),
            deatils=Notify.deatils,
            mainuid=Notify.mainuid,
            targetid=Notify.targetid,
            isreded=False,
            createdAt=created_at_timestamp,
            user=Usergrpc(name=Notify.user.name, avatar=Notify.user.avatar)
        )

        print("request", request)

        response = stub.SendGrpcNotification(request)
        print("Notification sent sucessfully", response)
    
    except Exception as e:
        print("enot", e)






