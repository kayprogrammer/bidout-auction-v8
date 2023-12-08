// email-sender.mock.ts
export class EmailSenderMock {
    async add(payload: any): Promise<any> {
      // Mock implementation
      console.log('Mocked emailSender.add() called');
      return payload; // You can customize the mock behavior as needed
    }
}